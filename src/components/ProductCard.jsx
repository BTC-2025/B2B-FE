export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow p-3">
      <img src={product.image} alt="" className="h-40 w-full rounded mb-3" />
      <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
      <p className="text-sm text-gray-600">{product.price}</p>
      <p className="text-xs text-gray-500 mb-2">MOQ: {product.moq}</p>
      <button className="w-full bg-primary text-white py-2 rounded">
        Contact Supplier
      </button>
    </div>
  );
}
