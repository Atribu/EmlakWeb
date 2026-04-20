import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { initialAdvisors, initialBlogPosts, initialProperties, initialUsers } from "@/lib/mock-data";
import { getDatabasePath } from "@/lib/persistent-storage";
import { pickSampleAdvisorImageForSeed } from "@/lib/sample-advisor-images";
import { pickSampleImageSet } from "@/lib/sample-images";

const DB_PATH = getDatabasePath();
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS advisors (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    title       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    whatsapp    TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    focusArea   TEXT NOT NULL,
    image       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    role       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    phone      TEXT NOT NULL,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    advisorId  TEXT
  );

  CREATE TABLE IF NOT EXISTS properties (
    id              TEXT PRIMARY KEY,
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    city            TEXT NOT NULL,
    district        TEXT NOT NULL,
    neighborhood    TEXT NOT NULL,
    type            TEXT NOT NULL,
    price           REAL NOT NULL,
    rooms           TEXT NOT NULL,
    areaM2          REAL NOT NULL,
    floor           TEXT NOT NULL,
    heating         TEXT NOT NULL,
    listingRef      TEXT NOT NULL,
    description     TEXT NOT NULL,
    highlights      TEXT NOT NULL DEFAULT '[]',
    features        TEXT NOT NULL DEFAULT '[]',
    infoItems       TEXT NOT NULL DEFAULT '[]',
    advisorId       TEXT NOT NULL,
    latitude        REAL NOT NULL DEFAULT 0,
    longitude       REAL NOT NULL DEFAULT 0,
    coverColor      TEXT NOT NULL DEFAULT '#6366f1',
    coverImage      TEXT NOT NULL DEFAULT '',
    galleryImages   TEXT NOT NULL DEFAULT '[]',
    imageLabels     TEXT NOT NULL DEFAULT '[]',
    translations    TEXT NOT NULL DEFAULT '{}',
    publishedAt     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id              TEXT PRIMARY KEY,
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    excerpt         TEXT NOT NULL,
    content         TEXT NOT NULL,
    coverImage      TEXT NOT NULL,
    authorName      TEXT NOT NULL,
    tags            TEXT NOT NULL DEFAULT '[]',
    metaTitle       TEXT NOT NULL,
    metaDescription TEXT NOT NULL,
    publishedAt     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id                TEXT PRIMARY KEY,
    propertySlug      TEXT NOT NULL,
    name              TEXT NOT NULL,
    email             TEXT NOT NULL,
    phone             TEXT NOT NULL,
    message           TEXT NOT NULL,
    stage             TEXT NOT NULL DEFAULT 'new',
    source            TEXT NOT NULL DEFAULT 'contact_form',
    preferredDate     TEXT,
    preferredTime     TEXT,
    appointmentNote   TEXT,
    assignedAdvisorId TEXT,
    pipelineNote      TEXT,
    createdAt         TEXT NOT NULL,
    updatedAt         TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seller_leads (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    email             TEXT NOT NULL,
    phone             TEXT NOT NULL,
    city              TEXT NOT NULL,
    district          TEXT NOT NULL,
    neighborhood      TEXT,
    propertyType      TEXT NOT NULL,
    subType           TEXT,
    areaM2            REAL,
    rooms             TEXT,
    buildingAge       TEXT,
    floor             TEXT,
    inCompound        TEXT,
    preferredDateTime TEXT,
    message           TEXT NOT NULL,
    createdAt         TEXT NOT NULL
  );
`);

function seedIfEmpty() {
  const advisorCount = (db.prepare("SELECT COUNT(*) as c FROM advisors").get() as { c: number }).c;
  if (advisorCount === 0) {
    const insertAdvisor = db.prepare(`
      INSERT OR IGNORE INTO advisors (id, name, title, phone, whatsapp, email, focusArea, image)
      VALUES (@id, @name, @title, @phone, @whatsapp, @email, @focusArea, @image)
    `);
    for (const a of initialAdvisors) {
      insertAdvisor.run({
        ...a,
        image: a.image || pickSampleAdvisorImageForSeed(a.id),
      });
    }
  }

  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, role, email, phone, username, password, advisorId)
      VALUES (@id, @name, @role, @email, @phone, @username, @password, @advisorId)
    `);
    const adminUser = {
      id: "usr-admin-demo",
      name: "Demo Admin",
      role: "admin",
      email: "admin@admin",
      phone: "+90 555 111 11 11",
      username: "admin@admin",
      password: "admin",
      advisorId: null,
    };
    insertUser.run(adminUser);
    for (const u of initialUsers) {
      if (u.email !== adminUser.email) {
        insertUser.run({ ...u, advisorId: u.advisorId ?? null });
      }
    }
  }

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  if (propCount === 0) {
    const insertProp = db.prepare(`
      INSERT OR IGNORE INTO properties
        (id, slug, title, city, district, neighborhood, type, price, rooms, areaM2,
         floor, heating, listingRef, description, highlights, features, infoItems,
         advisorId, latitude, longitude, coverColor, coverImage, galleryImages,
         imageLabels, translations, publishedAt)
      VALUES
        (@id, @slug, @title, @city, @district, @neighborhood, @type, @price, @rooms, @areaM2,
         @floor, @heating, @listingRef, @description, @highlights, @features, @infoItems,
         @advisorId, @latitude, @longitude, @coverColor, @coverImage, @galleryImages,
         @imageLabels, @translations, @publishedAt)
    `);
    initialProperties.forEach((p, i) => {
      const sampleSet = pickSampleImageSet(i + 1);
      insertProp.run({
        ...p,
        highlights: JSON.stringify(p.highlights ?? []),
        features: JSON.stringify(p.features ?? []),
        infoItems: JSON.stringify(p.infoItems ?? []),
        galleryImages: JSON.stringify(p.galleryImages ?? sampleSet.gallery),
        imageLabels: JSON.stringify(p.imageLabels ?? []),
        translations: JSON.stringify(p.translations ?? {}),
        coverImage: p.coverImage || sampleSet.cover,
        latitude: p.latitude ?? 41.0082,
        longitude: p.longitude ?? 28.9784,
      });
    });
  }

  const blogCount = (db.prepare("SELECT COUNT(*) as c FROM blog_posts").get() as { c: number }).c;
  if (blogCount === 0) {
    const insertBlog = db.prepare(`
      INSERT OR IGNORE INTO blog_posts
        (id, slug, title, excerpt, content, coverImage, authorName, tags, metaTitle, metaDescription, publishedAt)
      VALUES
        (@id, @slug, @title, @excerpt, @content, @coverImage, @authorName, @tags, @metaTitle, @metaDescription, @publishedAt)
    `);
    for (const b of initialBlogPosts) {
      insertBlog.run({ ...b, tags: JSON.stringify(b.tags ?? []) });
    }
  }
}

seedIfEmpty();

export default db;
