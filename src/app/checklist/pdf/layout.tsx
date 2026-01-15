import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Speed Checklist PDF | Theo Daudebourg',
  description: 'Print-friendly 10-point Shopify speed checklist. Find what\'s slowing your store.',
};

export default function ChecklistPDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
