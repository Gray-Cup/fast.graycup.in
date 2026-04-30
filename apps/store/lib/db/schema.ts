import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderRef: text("order_ref").unique().notNull(),
  cashfreeOrderId: text("cashfree_order_id"),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  variantLabel: text("variant_label").notNull(),
  quantity: integer("quantity").notNull(),
  amount: integer("amount").notNull(),
  gstAmount: integer("gst_amount").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address").notNull(),
  customerPincode: text("customer_pincode").notNull(),
  status: text("status").notNull().default("PENDING"),
  delhiveryWaybill: text("delhivery_waybill"),
  invoiceKey: text("invoice_key"),
  invoiceNumber: text("invoice_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;