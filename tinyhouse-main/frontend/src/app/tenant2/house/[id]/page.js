import HouseDetailClient from './HouseDetailClient';
 
export default function HouseDetailPage({ params }) {
  return <HouseDetailClient id={params.id} />;
} 