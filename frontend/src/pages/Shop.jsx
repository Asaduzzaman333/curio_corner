import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import { api } from "../utils/api.js";
import { categories as fallbackCategories, fallbackProducts } from "../data/fallback.js";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(fallbackProducts);
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");
  const category = params.get("category") || "All";
  const featuredOnly = params.get("featured") === "true";
  const trendingOnly = params.get("trending") === "true";

  const clearCollectionFilter = (next) => {
    next.delete("featured");
    next.delete("trending");
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/products", {
        params: {
          search: params.get("search") || undefined,
          category: category === "All" ? undefined : category,
          featured: featuredOnly ? "true" : undefined,
          trending: trendingOnly ? "true" : undefined,
          limit: featuredOnly || trendingOnly ? 60 : 24
        }
      })
      .then(({ data }) => mounted && setProducts(data.items?.length ? data.items : fallbackProducts))
      .catch(() => mounted && setProducts(fallbackProducts))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [params, category]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/categories")
      .then(({ data }) => mounted && setCategoryOptions(data.items?.length ? data.items : fallbackCategories))
      .catch(() => mounted && setCategoryOptions(fallbackCategories));
    return () => {
      mounted = false;
    };
  }, []);

  const shown = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const featuredMatch = !featuredOnly || product.isFeatured;
      const trendingMatch = !trendingOnly || product.isTrending;
      const searchMatch = !search || `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && featuredMatch && trendingMatch && searchMatch;
    });
  }, [products, category, featuredOnly, trendingOnly, search]);

  const submitSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (search) next.set("search", search);
    else next.delete("search");
    setParams(next);
  };

  return (
    <section className="min-h-screen px-5 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-clay">Shop</p>
            <h1 className="font-display text-5xl font-bold">
              {featuredOnly ? "Featured pieces" : trendingOnly ? "Trending pieces" : "Handmade collection"}
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65 dark:text-vellum/65">Search, filter, and choose gifts crafted for emotion, texture, and memory.</p>
          </div>
          <form onSubmit={submitSearch} className="glass flex rounded-full p-2">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cards, gifts, art..." className="min-w-0 flex-1 bg-transparent px-4 outline-none" />
            <button className="rounded-full bg-ink p-3 text-vellum dark:bg-vellum dark:text-ink" aria-label="Search">
              <Search size={19} />
            </button>
          </form>
        </div>
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {["All", ...categoryOptions].map((item) => (
            <button
              key={item}
              onClick={() => {
                const next = new URLSearchParams(params);
                item === "All" ? next.delete("category") : next.set("category", item);
                clearCollectionFilter(next);
                setParams(next);
              }}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${!featuredOnly && !trendingOnly && category === item ? "bg-ink text-vellum dark:bg-vellum dark:text-ink" : "bg-vellum text-ink/70 hover:text-clay dark:bg-white/10 dark:text-vellum/70"}`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("category");
              next.delete("trending");
              next.set("featured", "true");
              setParams(next);
            }}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${featuredOnly ? "bg-ink text-vellum dark:bg-vellum dark:text-ink" : "bg-vellum text-ink/70 hover:text-clay dark:bg-white/10 dark:text-vellum/70"}`}
          >
            Featured
          </button>
          <button
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("category");
              next.delete("featured");
              next.set("trending", "true");
              setParams(next);
            }}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${trendingOnly ? "bg-ink text-vellum dark:bg-vellum dark:text-ink" : "bg-vellum text-ink/70 hover:text-clay dark:bg-white/10 dark:text-vellum/70"}`}
          >
            Trending
          </button>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : shown.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{shown.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        ) : (
          <div className="rounded-[32px] bg-vellum p-12 text-center shadow-soft dark:bg-[#211915]">
            <h2 className="font-display text-3xl font-bold">No pieces found</h2>
            <p className="mt-3 text-ink/60 dark:text-vellum/60">Try another category or search term.</p>
          </div>
        )}
      </div>
    </section>
  );
}
