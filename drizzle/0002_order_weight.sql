ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "weight_category" text NOT NULL DEFAULT '150gm';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "unit_weight_grams" integer NOT NULL DEFAULT 150;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "total_weight_grams" integer NOT NULL DEFAULT 150;--> statement-breakpoint
UPDATE "orders" SET
  "weight_category" = CASE
    WHEN "variant_label" ILIKE '%500gm%' AND "variant_label" NOT ILIKE '%150gm%' THEN '500gm'
    WHEN "variant_label" ILIKE '%,%' OR "variant_label" ILIKE '%+%' OR "variant_label" ILIKE '% %' THEN 'mixed'
    ELSE '150gm'
  END;--> statement-breakpoint
UPDATE "orders" SET
  "unit_weight_grams" = CASE
    WHEN "weight_category" = '500gm' THEN 500
    WHEN "weight_category" = 'mixed' THEN 150
    ELSE 150
  END;--> statement-breakpoint
UPDATE "orders" SET
  "total_weight_grams" = "quantity" * CASE
    WHEN "weight_category" = '500gm' THEN 500
    ELSE 150
  END;--> statement-breakpoint
