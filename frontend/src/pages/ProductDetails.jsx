import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, PackageCheck, PlayCircle, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../utils/api.js";
import { createDirectOrderItem, saveDirectOrder } from "../utils/directOrder.js";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [active, setActive] = useState("/assets/cover.jpg");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [zoomStyle, setZoomStyle] = useState({});

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2)" });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: "center", transform: "scale(1)" });
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        if (mounted) {
          setProduct(data);
          setActive(data.images?.[0]?.url || "/assets/cover.jpg");
          setQuantity(1);
        }
      })
      .catch(() => {
        if (mounted) {
          toast.error("Product unavailable");
          navigate("/shop");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  if (loading) {
    return (
      <section className="min-h-screen px-5 pb-24 pt-32">
        <div className="mx-auto max-w-7xl text-center">
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  if (!product) return null;

  const price = product.discountPrice || product.price;
  const updateQuantity = (value) => setQuantity(Math.max(1, Number(value) || 1));

  const orderNow = () => {
    saveDirectOrder(createDirectOrderItem(product, quantity));
    navigate("/checkout?direct=true");
  };

  return (
    <section className="min-h-screen px-5 pb-24 pt-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <div 
            className="group overflow-hidden rounded-[36px] bg-paper shadow-soft dark:bg-[#211915] cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={active} 
              alt={product.name} 
              className="aspect-square sm:aspect-[4/4.2] w-full object-cover block transition-transform duration-300 ease-out" 
              style={zoomStyle} 
            />
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {(product.images?.length ? product.images : [{ url: "/assets/cover.jpg" }]).map((image) => (
              <button key={image.url} onClick={() => setActive(image.url)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${active === image.url ? "border-clay" : "border-transparent"}`}>
                <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-clay">{product.category}</p>
          <h1 className="font-display text-5xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-5 text-lg leading-8 text-ink/68 dark:text-vellum/68">{product.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags?.map((tag) => <span key={tag} className="rounded-full bg-sage/10 px-3 py-1 text-sm font-semibold text-sage">{tag}</span>)}
            <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">{product.stockStatus}</span>
          </div>
          <div className="mt-8 flex items-end gap-3">
            <span className="text-4xl font-bold">৳{price}</span>
            {product.discountPrice && <span className="pb-1 text-lg text-ink/45 line-through dark:text-vellum/45">৳{product.price}</span>}
          </div>
          <div className="mt-8 flex items-center justify-between gap-4 rounded-[28px] border border-ink/10 bg-vellum/70 p-4 shadow-soft dark:border-white/10 dark:bg-[#211915]">
            <span className="text-sm font-semibold text-ink/65 dark:text-vellum/65">Quantity</span>
            <div className="flex items-center rounded-full border border-ink/10 bg-paper dark:border-white/10 dark:bg-white/5">
              <button type="button" onClick={() => updateQuantity(quantity - 1)} className="focus-ring rounded-full p-3 text-ink/70 transition hover:text-clay dark:text-vellum/70" aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <input type="number" min="1" value={quantity} onChange={(event) => updateQuantity(event.target.value)} className="w-14 bg-transparent text-center font-semibold outline-none" />
              <button type="button" onClick={() => updateQuantity(quantity + 1)} className="focus-ring rounded-full p-3 text-ink/70 transition hover:text-clay dark:text-vellum/70" aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button onClick={() => addItem(product, quantity)} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 px-6 py-4 font-semibold transition hover:border-clay hover:text-clay dark:border-white/10">
              <ShoppingBag size={19} /> Add to Cart
            </button>
            <button onClick={orderNow} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-semibold text-vellum shadow-lift transition hover:bg-clay dark:bg-vellum dark:text-ink">
              <PackageCheck size={19} /> Order Now
            </button>
          </div>
          {product.videoUrl && (
            <a href={product.videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 px-6 py-4 font-semibold hover:text-clay dark:border-white/10">
              <PlayCircle size={19} /> Watch Product Video
            </a>
          )}
          <Link to="/checkout" className="mt-4 block text-center text-sm font-semibold text-clay">Go to cart checkout</Link>
        </div>
      </div>
    </section>
  );
}
