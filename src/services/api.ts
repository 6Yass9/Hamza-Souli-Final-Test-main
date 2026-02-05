import { Appointment, GalleryItem, User, Album, ClientDocument } from '../types';
import { supabase } from './supabaseClient';

// helpers to map DB rows -> TS types
const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email ?? undefined,
  phone: row.phone ?? '',
  role: row.role,
  status: row.status ?? 'active',
  loginCode: row.login_code ?? undefined,
  documents: [] // loaded separately
});

const mapAppointment = (row: any): Appointment => ({
  id: row.id,
  date: row.date,
  time: row.time ?? '',
  clientName: row.client_name,
  status: row.status,
  type: row.type ?? '',
  staffId: row.user_id ?? undefined, // ✅ maps to appointments.user_id
  staffNote: row.staff_note ?? row.staff_notes ?? null
});

const mapAlbum = (row: any): Album => ({
  id: row.id,
  title: row.title,
  clientId: row.client_id ?? undefined,
  coverUrl: row.cover_url ?? '',
  createdAt: row.created_at
});

const mapGalleryItem = (row: any): GalleryItem => ({
  id: row.id,
  albumId: row.album_id,
  url: row.url,
  title: row.title ?? '',

  // NEW (optional columns): supports images + videos
  mediaType: (row.media_type as any) ?? 'image',
  mimeType: row.mime_type ?? null,
  storagePath: row.storage_path ?? null
});

const mapClientDocument = (row: any): ClientDocument => {
  const uploadedAt: string = row.uploaded_at ?? row.created_at ?? '';
  const uploadDate =
    typeof uploadedAt === 'string' && uploadedAt.includes('T') ? uploadedAt.split('T')[0] : uploadedAt || '';

  return {
    id: row.id,
    name: row.name,
    url: row.url,
    type: row.type,
    uploadDate
  };
};

const generateError = (prefix: string, error: any) => {
  console.error(prefix, error);
  throw new Error(prefix);
};

// Uploads a File (image/video) to Supabase Storage and returns a public URL + metadata.
// NOTE: Requires a Supabase Storage bucket named "media".
const uploadMediaToStorage = async (
  file: File,
  folder: 'portfolio' | 'clients',
  albumId: string
): Promise<{ publicUrl: string; path: string; mimeType: string | null; mediaType: 'image' | 'video' }> => {
  const bucket = 'media';

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeBase = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .slice(0, 60);
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${folder}/${albumId}/${unique}-${safeBase}.${ext}`;

  const { error: uploadError } = await supabase().storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });

  if (uploadError) {
    console.error('uploadMediaToStorage error', uploadError);
    throw new Error(uploadError.message || 'Upload failed');
  }

  const { data } = supabase().storage.from(bucket).getPublicUrl(path);
  const publicUrl = data.publicUrl;
  const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

  return {
    publicUrl,
    path,
    mimeType: file.type || null,
    mediaType
  };
};

export const api = {
  // --- Auth ---

  // ✅ Unified login for Admin + Staff (email + password)
  loginStaffOrAdmin: async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'staff', email, password })
    });

    if (!res.ok) return null;

    const { token, user } = await res.json();
    localStorage.setItem('app_token', token);
    return user;
  },

  // ✅ Client login (6-digit code)
  loginClient: async (code: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'client', code })
    });

    if (!res.ok) return null;

    const { token, user } = await res.json();
    localStorage.setItem('app_token', token);
    return user;
  },

  // --- Staff ---

  getStaff: async (): Promise<User[]> => {
    const { data, error } = await supabase()
      .from('users')
      .select('*')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('getStaff error', error);
      return [];
    }
    return data.map(mapUser);
  },
  // ✅ Staff: get appointments assigned to a staff member (appointments.user_id)
  getStaffAppointments: async (staffId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase()
      .from('appointments')
      .select('*')
      .eq('user_id', staffId)
      .order('date', { ascending: true });

    if (error || !data) {
      console.error('getStaffAppointments error', error);
      return [];
    }
    return data.map(mapAppointment);
  },

  // ✅ Client: get appointments for the logged-in client (matches appointments.phone OR name)
  getClientAppointments: async (client: { name?: string; phone?: string }): Promise<Appointment[]> => {
    const name = client.name?.trim();
    const phone = client.phone?.trim();

    let q = supabase().from('appointments').select('*').order('date', { ascending: true });

    if (phone) {
      q = q.eq('phone', phone);
    } else if (name) {
      q = q.eq('client_name', name);
    }

    const { data, error } = await q;
    if (error || !data) {
      console.error('getClientAppointments error', error);
      return [];
    }

    return data.map(mapAppointment);
  },

  // ✅ Admin: create an appointment for a client and optionally assign staff
  createAdminAppointment: async (payload: {
    clientName: string;
    phone: string;
    date: string;
    time: string;
    type: string;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    staffId?: string;
    staffNote?: string;
  }): Promise<Appointment | null> => {
    const insertPayload: any = {
      client_name: payload.clientName.trim(),
      phone: payload.phone.trim(),
      date: payload.date,
      time: payload.time || '10:00',
      type: payload.type || 'Other',
      status: payload.status || 'confirmed',
      user_id: payload.staffId || null,
      staff_note: payload.staffNote?.trim() ? payload.staffNote.trim() : null
    };

    const { data, error } = await supabase()
      .from('appointments')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      console.error('createAdminAppointment error', error);
      return null;
    }

    return mapAppointment(data);
  },


  createStaff: async (
    firstName: string,
    familyName: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<User> => {
    const fn = firstName?.trim();
    const ln = familyName?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password;
    const cleanPhone = phone?.trim() ? phone.trim() : null;

    if (!fn || !ln) throw new Error('First name and family name are required');
    if (!cleanEmail) throw new Error('Email is required');
    if (!cleanPassword) throw new Error('Password is required');

    // optional: check email uniqueness
    const { data: existing, error: existingError } = await supabase()
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingError) {
      console.error('Failed to check staff email', existingError);
      throw new Error(existingError.message || 'Failed to validate staff email');
    }
    if (existing) throw new Error('Email already in use');

    const fullName = `${fn} ${ln}`.trim();

    const { data, error } = await supabase()
      .from('users')
      .insert({
        name: fullName,
        email: cleanEmail,
        password: cleanPassword, // NOTE: will be replaced by hashes later
        phone: cleanPhone,
        role: 'staff',
        status: 'active'
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Failed to create staff', error);
      throw new Error(error?.message || 'Failed to create staff member');
    }

    return mapUser(data);
  },

  // --- Clients ---

  getClients: async (): Promise<User[]> => {
    const { data, error } = await supabase()
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('getClients error', error);
      return [];
    }
    return data.map(mapUser);
  },

  createClient: async (name: string, email?: string, phone?: string, loginCode?: string): Promise<User> => {
    const cleanName = name?.trim();
    const cleanLoginCode = loginCode?.trim();

    if (!cleanName || !cleanLoginCode) throw new Error('Name and login code are required');

    const cleanEmail = email?.trim() ? email.trim() : null;
    const cleanPhone = phone?.trim() ? phone.trim() : null;

    const { data: existing, error: existingError } = await supabase()
      .from('users')
      .select('id')
      .eq('login_code', cleanLoginCode)
      .maybeSingle();

    if (existingError) {
      console.error('Failed to check login code', existingError);
      throw new Error(existingError.message || 'Failed to validate login code');
    }
    if (existing) throw new Error('Login code already in use');

    const { data, error } = await supabase()
      .from('users')
      .insert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'client',
        status: 'active',
        login_code: cleanLoginCode // NOTE: will be replaced by hashes later
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Failed to create client', error);
      throw new Error(error?.message || 'Failed to create client');
    }

    return mapUser(data);
  },

  updateClient: async (id: string, updates: Partial<User>): Promise<User | null> => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.loginCode !== undefined) payload.login_code = updates.loginCode;

    const { data, error } = await supabase().from('users').update(payload).eq('id', id).select('*').maybeSingle();

    if (error) {
      console.error('updateClient error', error);
      return null;
    }
    if (!data) return null;

    return mapUser(data);
  },

  archiveClient: async (id: string): Promise<void> => {
    const { error } = await supabase().from('users').update({ status: 'archived' }).eq('id', id);
    if (error) generateError('Failed to archive client', error);
  },

  unarchiveClient: async (id: string): Promise<void> => {
    const { error } = await supabase().from('users').update({ status: 'active' }).eq('id', id);
    if (error) generateError('Failed to unarchive client', error);
  },

  uploadDocument: async (
    clientId: string,
    name: string,
    dataUrl: string,
    type: ClientDocument['type']
  ): Promise<ClientDocument | null> => {
    const { data, error } = await supabase()
      .from('client_documents')
      .insert({
        user_id: clientId,
        name,
        url: dataUrl,
        type
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('uploadDocument error', error);
      return null;
    }

    return mapClientDocument(data);
  },

  deleteDocument: async (clientId: string, docId: string): Promise<void> => {
    const { error } = await supabase().from('client_documents').delete().eq('user_id', clientId).eq('id', docId);
    if (error) generateError('Failed to delete document', error);
  },

  getClientDocuments: async (clientId: string): Promise<ClientDocument[]> => {
    const { data, error } = await supabase()
      .from('client_documents')
      .select('*')
      .eq('user_id', clientId)
      .order('uploaded_at', { ascending: false });

    if (error || !data) {
      console.error('getClientDocuments error', error);
      return [];
    }

    return data.map(mapClientDocument);
  },

  // --- Appointments ---

  getAppointments: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase().from('appointments').select('*').order('date', { ascending: true });
    if (error || !data) {
      console.error('getAppointments error', error);
      return [];
    }
    return data.map(mapAppointment);
  },

  getBookedDates: async (): Promise<string[]> => {
    const { data, error } = await supabase().from('appointments').select('date, status');
    if (error || !data) {
      console.error('getBookedDates error', error);
      return [];
    }

    return data
      .filter((a: any) => a.status === 'pending' || a.status === 'confirmed' || !a.status)
      .map((a: any) => a.date);
  },

  createAppointment: async (date: string, name: string, phone: string) => {
    if (!date || !name || !phone) {
      throw new Error('Missing required fields');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(date) < today) {
      throw new Error('Cannot book in the past');
    }

    const payload = {
      date,
      time: '10:00',
      client_name: name.trim(),
      phone: phone.trim(),
      status: 'pending',
      type: 'Consultation Request'
    };

    const { error } = await supabase().from('appointments').insert(payload);
    if (error) generateError('Failed to create appointment', error);

    return { success: true };
  },

  updateAppointment: async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
    const payload: any = {};
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.time !== undefined) payload.time = updates.time;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.type !== undefined) payload.type = updates.type;

    if (updates.staffNote !== undefined) payload.staff_note = updates.staffNote;

    // ✅ staff assignment stored in appointments.user_id
    if (updates.staffId !== undefined) payload.user_id = updates.staffId || null;

    const { data, error } = await supabase().from('appointments').update(payload).eq('id', id).select('*').maybeSingle();

    if (error) {
      console.error('updateAppointment error', error);
      return null;
    }
    if (!data) return null;

    return mapAppointment(data);
  },

  // --- Albums & Gallery ---
  // --- Public Portfolio ---

  getPublicAlbums: async (): Promise<Album[]> => {
    const { data, error } = await supabase().from('albums').select('*').is('client_id', null).order('created_at', { ascending: false });

    if (error || !data) {
      console.error('getPublicAlbums error', error);
      return [];
    }

    return data.map(mapAlbum);
  },

  getPublicPhotos: async (): Promise<GalleryItem[]> => {
    const { data, error } = await supabase()
      .from('gallery_items')
      .select('*, albums!inner(client_id)')
      .is('albums.client_id', null)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('getPublicPhotos error', error);
      return [];
    }

    return (data as any[]).map(mapGalleryItem);
  },

  getAlbums: async (): Promise<Album[]> => {
    const { data, error } = await supabase().from('albums').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      console.error('getAlbums error', error);
      return [];
    }
    return data.map(mapAlbum);
  },

  getClientAlbums: async (clientId: string): Promise<Album[]> => {
    const { data, error } = await supabase().from('albums').select('*').eq('client_id', clientId).order('created_at', { ascending: false });

    if (error || !data) {
      console.error('getClientAlbums error', error);
      return [];
    }
    return data.map(mapAlbum);
  },

  createAlbum: async (title: string, clientId?: string): Promise<Album> => {
    const normalizedClientId = clientId?.trim() ? clientId.trim() : null;

    const { data, error } = await supabase()
      .from('albums')
      .insert({
        title,
        client_id: normalizedClientId
      })
      .select('*')
      .single();

    if (error || !data) generateError('Failed to create album', error);
    return mapAlbum(data);
  },

  deleteAlbum: async (id: string): Promise<void> => {
    const { error } = await supabase().from('albums').delete().eq('id', id);
    if (error) generateError('Failed to delete album', error);
  },

  getGalleryByAlbum: async (albumId: string): Promise<GalleryItem[]> => {
    const { data, error } = await supabase().from('gallery_items').select('*').eq('album_id', albumId).order('created_at', { ascending: true });

    if (error || !data) {
      console.error('getGalleryByAlbum error', error);
      return [];
    }
    return data.map(mapGalleryItem);
  },

  getAllPhotos: async (): Promise<GalleryItem[]> => {
    const { data, error } = await supabase().from('gallery_items').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      console.error('getAllPhotos error', error);
      return [];
    }
    return data.map(mapGalleryItem);
  },

  getClientGallery: async (clientId: string): Promise<GalleryItem[]> => {
    const { data, error } = await supabase().from('gallery_items').select('*, albums!inner(client_id)').eq('albums.client_id', clientId);

    if (error || !data) {
      console.error('getClientGallery error', error);
      return [];
    }
    return (data as any[]).map(mapGalleryItem);
  },

  // NEW: Upload images/videos to Supabase Storage bucket "media" and create a gallery item.
  // - If album has client_id => stored under clients/<albumId>/...
  // - Else => portfolio/<albumId>/...
  addGalleryMediaFile: async (albumId: string, file: File, title?: string): Promise<GalleryItem> => {
    const { data: album, error: albumErr } = await supabase()
      .from('albums')
      .select('id, client_id, cover_url')
      .eq('id', albumId)
      .single();

    if (albumErr || !album) {
      console.error('addGalleryMediaFile album lookup error', albumErr);
      throw new Error('Album not found');
    }

    const folder: 'portfolio' | 'clients' = album.client_id ? 'clients' : 'portfolio';
    const uploaded = await uploadMediaToStorage(file, folder, albumId);

    const { data, error } = await supabase()
      .from('gallery_items')
      .insert({
        album_id: albumId,
        url: uploaded.publicUrl,
        title: title ?? file.name.replace(/\.[^/.]+$/, ''),
        media_type: uploaded.mediaType,
        mime_type: uploaded.mimeType,
        storage_path: uploaded.path
      })
      .select('*')
      .single();

    if (error || !data) generateError('Failed to add gallery item', error);

    // Set album cover only if empty AND uploaded is an image (covers should be images)
    if (!album.cover_url && uploaded.mediaType === 'image') {
      await supabase().from('albums').update({ cover_url: uploaded.publicUrl }).eq('id', albumId);
    }

    return mapGalleryItem(data);
  },

  addGalleryItem: async (albumId: string, url: string, title?: string): Promise<GalleryItem> => {
    // Backward-compatible method: accepts a URL (or base64) and tries to infer media type from URL.
    // Prefer addGalleryMediaFile for real file uploads.
    const lower = (url || '').toLowerCase();
    const looksLikeVideo =
      lower.startsWith('data:video/') ||
      /\.(mp4|webm|mov|m4v|avi)(\?|#|$)/.test(lower);
    const inferredMediaType: 'image' | 'video' = looksLikeVideo ? 'video' : 'image';

    const { data, error } = await supabase()
      .from('gallery_items')
      .insert({
        album_id: albumId,
        url,
        title: title ?? null,
        media_type: inferredMediaType,
        mime_type: null,
        storage_path: null
      })
      .select('*')
      .single();

    if (error || !data) generateError('Failed to add gallery item', error);

    const { data: album, error: albumError } = await supabase().from('albums').select('*').eq('id', albumId).maybeSingle();

    if (!albumError && album && !album.cover_url && inferredMediaType === 'image') {
      await supabase().from('albums').update({ cover_url: url }).eq('id', albumId);
    }

    return mapGalleryItem(data);
  },

  deleteGalleryItem: async (id: string): Promise<void> => {
    const { error } = await supabase().from('gallery_items').delete().eq('id', id);
    if (error) generateError('Failed to delete gallery item', error);
  },

  getGallery: async (albumId?: string): Promise<GalleryItem[]> => {
    if (albumId) return api.getGalleryByAlbum(albumId);
    return api.getAllPhotos();
  },

  // --- Reviews (stub) ---
  submitReview: async (clientId: string, review: string) => {
    console.log(`Review from ${clientId}: ${review}`);
    return { success: true };
  }
};

export default api;