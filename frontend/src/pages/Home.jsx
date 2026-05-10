import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Heart, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { api } from "../utils/api.js";
import { categories, fallbackProducts } from "../data/fallback.js";

const categoryIcons = [Gift, Heart, Sparkles, Star, ArrowRight];

export default function Home() {
  const { settings } = useSite();
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/products", { params: { limit: 8 } })
      .then(({ data }) => mounted && data.items?.length && setProducts(data.items))
      .catch(() => mounted && setProducts(fallbackProducts))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => products.filter((product) => product.isFeatured).slice(0, 4), [products]);
  const trending = useMemo(() => products.filter((product) => product.isTrending).slice(0, 4), [products]);

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden px-5 pb-20 pt-28">
        <div className="absolute inset-0">
          <img src={settings.cover?.url || "/assets/cover.jpg"} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-paper/95 via-paper/72 to-ink/35 dark:from-[#17120f]/92 dark:via-[#17120f]/72 dark:to-black/55" />
        </div>
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute right-[8%] top-32 hidden rounded-full bg-vellum/80 p-5 shadow-soft md:block">
          <Sparkles className="text-gold" />
        </motion.div>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-24 left-[7%] hidden rounded-full bg-vellum/75 p-4 shadow-soft sm:block">
          <Heart className="text-rosewood" />
        </motion.div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-end gap-10 lg:min-h-[70vh] lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-clay/25 bg-vellum/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-clay backdrop-blur">
              Premium paper craft studio
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] sm:text-7xl lg:text-8xl">{settings.homepage?.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/75 dark:text-vellum/75">{settings.homepage?.subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-vellum shadow-lift transition hover:bg-clay">
                {settings.homepage?.ctaLabel || "Explore Collection"} <ArrowRight size={18} />
              </Link>
              <a href="#contact" className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink/15 bg-vellum/70 px-6 py-3 font-semibold backdrop-blur transition hover:border-clay hover:text-clay dark:border-white/15">
                Custom Order
              </a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="glass rounded-[36px] p-5 shadow-soft">
            <div className="grid grid-cols-3 gap-3">
              {products.slice(0, 3).map((product, index) => (
                <Link key={product._id} to={`/products/${product.slug}`} className={`${index === 1 ? "mt-10" : ""} overflow-hidden rounded-[28px] shadow-soft`}>
                  <img src={product.images?.[0]?.url || "/assets/cover.jpg"} alt={product.name} className="aspect-[3/4] h-full w-full object-cover transition duration-700 hover:scale-105" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Featured" title="Pieces made to feel personal" body="Soft textures, careful palettes, and handmade finishing turn simple gifts into keepsakes." />
          {loading ? <SkeletonGrid /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
        </div>
      </section>

      <section className="paper-texture px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Categories" title="Designed around the occasion" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category, index) => (
              <CategoryTile key={category} category={category} Icon={categoryIcons[index % categoryIcons.length]} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[36px] shadow-soft">
            <img src={settings.cover?.url || "/assets/cover.jpg"} alt="Handmade craft table" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-clay">About the brand</p>
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">{settings.about?.title}</h2>
            <p className="mt-6 text-lg leading-8 text-ink/68 dark:text-vellum/68">{settings.about?.body}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Hand cut", "Personalized", "Gift ready"].map((item) => (
                <div key={item} className="rounded-3xl border border-ink/10 p-5 dark:border-white/10">
                  <Sparkles className="mb-4 text-gold" />
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="paper-texture px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Trending" title="Loved this week" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{(trending.length ? trending : products.slice(0, 4)).map((product) => <ProductCard key={product._id} product={product} />)}</div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Gallery" title="A softer way to gift" />
          <div className="grid auto-rows-[180px] gap-4 md:grid-cols-4">
            {products.slice(0, 6).map((product, index) => (
              <div key={product._id} className={`${index === 0 || index === 5 ? "md:row-span-2" : ""} overflow-hidden rounded-[28px] shadow-soft`}>
                <img src={product.images?.[0]?.url || "/assets/cover.jpg"} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {settings.testimonials?.map((testimonial) => (
            <blockquote key={testimonial.name} className="rounded-[32px] bg-vellum p-8 shadow-soft dark:bg-[#211915]">
              <p className="font-display text-2xl leading-snug">"{testimonial.quote}"</p>
              <footer className="mt-6 text-sm font-semibold text-clay">{testimonial.name} · {testimonial.location}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="contact" className="px-5 pb-24">
        <div className="mx-auto max-w-7xl rounded-[36px] bg-ink p-8 text-vellum shadow-lift md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-gold">Custom order</p>
              <h2 className="font-display text-4xl font-bold">Tell us the feeling. We will shape the gift.</h2>
              <p className="mt-4 max-w-2xl text-vellum/70">{settings.contact?.email} · {settings.contact?.phone}</p>
            </div>
            <a href={`https://wa.me/${(settings.whatsappNumber || "").replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full bg-vellum px-6 py-3 text-center font-semibold text-ink transition hover:bg-gold">
              Start on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
<<<<<<< HEAD

function CategoryTile({ category, Icon }) {
  return (
    <Link to={`/shop?category=${encodeURIComponent(category)}`} className="group rounded-[28px] bg-vellum p-6 shadow-soft transition hover:-translate-y-1 dark:bg-[#211915]">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-clay/10 text-clay">
        <Icon size={21} />
      </div>
      <h3 className="font-display text-xl font-bold">{category}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/60 dark:text-vellum/60">Explore handmade details for meaningful gifting.</p>
    </Link>
  );
}
=======
>>>>>>> 4292013668882ef06c50bcc3180dcc50f830320d
