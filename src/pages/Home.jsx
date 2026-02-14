import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import ProductCard from "../components/ProductCard";
import { products } from "../data/Product";

export default function Home() {
  return (
    <div className="bg-background h-screen flex flex-col">
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Green Banner */}
        <div className="bg-primary text-white px-10 py-10 text-3xl font-bold">
          New Arrivals
          <span className="text-lg font-normal ml-4">
            Stay ahead with the latest offerings
          </span>
        </div>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold">Low-MOQ trials</h2>
            <span className="text-primary cursor-pointer hover:underline">
              View more →
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-12 mb-6">
            <h2 className="text-2xl font-semibold mb-6">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Mocking more content for "Amazon density" look */}
              {products.map((p) => (
                <ProductCard key={`${p.id}-dup`} product={p} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
