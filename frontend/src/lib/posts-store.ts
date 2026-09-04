import fs from 'fs';
import path from 'path';

export interface AntaraPost {
  _id: string;
  Name: string;
  Location: string;
  'Preferred way of contact': string;
  'Contact info': string;
  'Frequency of domestic violence': string;
  'Relationship with perpetrator': string;
  'Severity of domestic violence': string;
  'Nature of domestic violence': string;
  'Impact on children': string;
  'Culprit details': string;
  'Other info': string;
  status: string;
  createdAt: string;
  state?: string;
  imageURL?: string;
}

const DEFAULT_POSTS: AntaraPost[] = [
  {
    _id: 'post_101',
    Name: 'Priya Sharma',
    Location: '28.6139, 77.2090',
    'Preferred way of contact': 'Phone',
    'Contact info': '+91 98765 43210',
    'Frequency of domestic violence': 'Daily',
    'Relationship with perpetrator': 'Spouse',
    'Severity of domestic violence': 'Very High',
    'Nature of domestic violence': 'Physical and Emotional Abuse',
    'Impact on children': 'Two children witnessed repeated threats',
    'Culprit details': 'Husband, aggressive behavior and financial control',
    'Other info': 'Immediate police protection and emergency shelter required',
    status: 'pending',
    state: 'Delhi',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    _id: 'post_102',
    Name: 'Ananya Verma',
    Location: '19.0760, 72.8777',
    'Preferred way of contact': 'Email',
    'Contact info': 'ananya.v@example.com',
    'Frequency of domestic violence': 'Weekly',
    'Relationship with perpetrator': 'In-laws',
    'Severity of domestic violence': 'High',
    'Nature of domestic violence': 'Verbal harassment and physical restriction',
    'Impact on children': 'No children',
    'Culprit details': 'Extended family members controlling movement',
    'Other info': 'Requests legal counseling and temporary accommodation',
    status: 'in-progress',
    state: 'Maharashtra',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'post_103',
    Name: 'Kavita Patel',
    Location: '12.9716, 77.5946',
    'Preferred way of contact': 'Text message',
    'Contact info': '+91 98111 22334',
    'Frequency of domestic violence': 'Occasional',
    'Relationship with perpetrator': 'Partner',
    'Severity of domestic violence': 'Medium',
    'Nature of domestic violence': 'Financial exploitation and coercion',
    'Impact on children': 'None',
    'Culprit details': 'Former partner withholding identification papers',
    'Other info': 'Needs cyber legal guidance and document recovery assistance',
    status: 'pending',
    state: 'Karnataka',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

// In-memory cache across requests in the serverless instance
let memoryPosts: AntaraPost[] = [...DEFAULT_POSTS];
const CACHE_FILE = path.join('/tmp', 'antara_posts.json');

function loadPosts(): AntaraPost[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPosts = parsed;
        return memoryPosts;
      }
    }
  } catch (err) {
    console.warn('Failed to load posts from cache file, using memory:', err);
  }
  return memoryPosts;
}

function savePosts(posts: AntaraPost[]) {
  memoryPosts = posts;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist posts to /tmp:', err);
  }
}

export function getAllPosts(): AntaraPost[] {
  return loadPosts();
}

export function getPostById(id: string): AntaraPost | undefined {
  const posts = loadPosts();
  return posts.find((p) => p._id === id || (p as any).id === id);
}

export function savePost(raw: any): AntaraPost {
  const posts = loadPosts();

  // Normalize Location
  let locationStr = '28.6139, 77.2090'; // Default coordinates
  if (raw.Location && typeof raw.Location === 'string' && raw.Location.includes(',')) {
    locationStr = raw.Location;
  } else if (raw.location) {
    if (typeof raw.location === 'object' && raw.location.lat && raw.location.lng) {
      locationStr = `${raw.location.lat}, ${raw.location.lng}`;
    } else if (typeof raw.location === 'string') {
      locationStr = raw.location;
    }
  }

  // Normalize Severity
  let severity = raw['Severity of domestic violence'] || raw.severity || 'High';
  const cleanSev = String(severity).trim().toLowerCase();
  if (cleanSev.includes('very high')) severity = 'Very High';
  else if (cleanSev.includes('high')) severity = 'High';
  else if (cleanSev.includes('medium') || cleanSev.includes('moderate')) severity = 'Medium';
  else if (cleanSev.includes('low')) severity = 'Low';
  else severity = 'High';

  const newPost: AntaraPost = {
    _id: raw._id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    Name: raw.Name || raw.name || 'Anonymous Victim',
    Location: locationStr,
    'Preferred way of contact':
      raw['Preferred way of contact'] ||
      (Array.isArray(raw.preferredContact) ? raw.preferredContact.join(', ') : raw.preferredContact) ||
      'Phone',
    'Contact info': raw['Contact info'] || raw.phone || raw.contact || 'Confidential',
    'Frequency of domestic violence':
      raw['Frequency of domestic violence'] || raw.frequency || 'Recurring',
    'Relationship with perpetrator':
      raw['Relationship with perpetrator'] || raw.relationship || 'Partner',
    'Severity of domestic violence': severity,
    'Nature of domestic violence':
      raw['Nature of domestic violence'] ||
      raw.currentSituation ||
      raw.nature ||
      'Physical and psychological distress',
    'Impact on children': raw['Impact on children'] || raw.visibleInjuries || 'Under assessment',
    'Culprit details': raw['Culprit details'] || raw.culprit || 'Confidential Details',
    'Other info': raw['Other info'] || raw.resText || raw.generatedText || 'Submitted via Antara Web Shield',
    status: raw.status || 'pending',
    createdAt: new Date().toISOString(),
    state: raw.state || undefined,
    imageURL: raw.imageURL || raw.resImage || undefined,
  };

  // Add to beginning of array so newest shows first
  const updated = [newPost, ...posts.filter((p) => p._id !== newPost._id)];
  savePosts(updated);

  return newPost;
}

export function updatePostStatus(id: string, status: string): boolean {
  const posts = loadPosts();
  const index = posts.findIndex((p) => p._id === id || (p as any).id === id);
  if (index !== -1) {
    posts[index].status = status;
    savePosts([...posts]);
    return true;
  }
  return false;
}
