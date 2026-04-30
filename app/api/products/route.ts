import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const revalidate = 60;

/** GET /api/products — list all active products */
export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM products WHERE active = true ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

/** POST /api/products — create a new product (admin) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, name, tagline, description, category, image_url, badge, variants } = body;

    if (!slug || !name || !tagline || !description || !category || !image_url || !variants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate slug uniqueness
    const existing = await sql`SELECT id FROM products WHERE slug = ${slug}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    const [product] = await sql`
      INSERT INTO products (slug, name, tagline, description, category, image_url, badge, variants)
      VALUES (${slug}, ${name}, ${tagline}, ${description}, ${category}, ${image_url}, ${badge || null}, ${JSON.stringify(variants)})
      RETURNING *
    `;

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
