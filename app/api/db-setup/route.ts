import { NextResponse } from "next/server";
import { setupSchema, sql } from "@/lib/db";
import { seedProducts } from "@/lib/products";

/** GET /api/db-setup — run once to create tables and seed products */
export async function GET() {
  try {
    await setupSchema();

    // Seed default products if table is empty
    const existing = await sql`SELECT COUNT(*) as count FROM products`;
    if (Number(existing[0].count) === 0) {
      for (const p of seedProducts) {
        await sql`
          INSERT INTO products (slug, name, tagline, description, category, image_url, badge, variants)
          VALUES (${p.slug}, ${p.name}, ${p.tagline}, ${p.description}, ${p.category}, ${p.image_url}, ${p.badge || null}, ${JSON.stringify(p.variants)})
          ON CONFLICT (slug) DO NOTHING
        `;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Schema created and products seeded successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
