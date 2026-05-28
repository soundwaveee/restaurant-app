import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, Link, NavLink, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, useNavigate } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createContext, useContext, useState, useMemo } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [items]);
  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);
  const addItem = (menuItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prevItems.map(
          (item) => item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { menuItem, quantity: 1 }];
    });
  };
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(
      (prevItems) => prevItems.map(
        (item) => item.menuItem.id === id ? { ...item, quantity } : item
      )
    );
  };
  const removeItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.menuItem.id !== id));
  };
  const clearCart = () => {
    setItems([]);
  };
  return /* @__PURE__ */ jsx(
    CartContext.Provider,
    {
      value: {
        items,
        totalAmount,
        totalCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart
      },
      children
    }
  );
}
function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
function Header() {
  return /* @__PURE__ */ jsx("header", { className: "bg-red-800 text-white shadow-lg", children: /* @__PURE__ */ jsxs("nav", { className: "container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center", children: [
    /* @__PURE__ */ jsx(Link, { to: "/", className: "text-2xl font-bold hover:text-red-300 transition-colors", children: "Ресторан Вандибо" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
      /* @__PURE__ */ jsx(
        NavLink,
        {
          to: "/",
          className: ({ isActive }) => isActive ? "text-red-300 font-medium" : "hover:text-red-300 transition-colors",
          children: "Главная"
        }
      ),
      /* @__PURE__ */ jsx(
        NavLink,
        {
          to: "/menu",
          className: ({ isActive }) => isActive ? "text-red-300 font-medium" : "hover:text-red-300 transition-colors",
          children: "Меню"
        }
      ),
      /* @__PURE__ */ jsx(
        NavLink,
        {
          to: "/cart",
          className: ({ isActive }) => isActive ? "text-red-300 font-medium" : "hover:text-red-300 transition-colors",
          children: "Корзина"
        }
      ),
      /* @__PURE__ */ jsx(
        NavLink,
        {
          to: "/about",
          className: ({ isActive }) => isActive ? "text-red-300 font-medium" : "hover:text-red-300 transition-colors",
          children: "О нас"
        }
      )
    ] })
  ] }) });
}
const restaurantInfo = {
  name: "Ресторан Вандибо",
  description: "Разные великолепные шедевры кулинарии Новосибирска ждут вас!",
  address: "г. Новосибирск, ул. Кирюхи Павлова, д. 2033",
  phone: "222-22-22",
  hours: "Ежедневно всегда для босяков"
};
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "bg-stone-800 text-stone-300 py-8 mt-auto", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 max-w-6xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-white mb-3", children: restaurantInfo.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: restaurantInfo.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-white mb-3", children: "Контакты" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: restaurantInfo.address }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: restaurantInfo.phone })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-white mb-3", children: "Режим работы" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: restaurantInfo.hours })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center text-xs text-stone-400 mt-6 pt-4 border-t border-stone-700", children: [
      "© 2024 ",
      restaurantInfo.name,
      ". Все права защищены киричем."
    ] })
  ] }) });
}
const links = () => [];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "ru",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(CartProvider, {
        children: /* @__PURE__ */ jsxs("div", {
          className: "min-h-screen flex flex-col",
          children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("main", {
            className: "flex-1",
            children
          }), /* @__PURE__ */ jsx(Footer, {})]
        })
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function Root() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function meta$4() {
  return [{
    title: `${restaurantInfo.name} | Аутентичная мексиканская кухня`
  }, {
    name: "description",
    content: restaurantInfo.description
  }];
}
const home = UNSAFE_withComponentProps(function HomePage() {
  return /* @__PURE__ */ jsx("div", {
    className: "container mx-auto px-4 py-12 max-w-6xl text-center",
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-6",
      children: [/* @__PURE__ */ jsxs("h1", {
        className: "text-5xl font-bold text-stone-800",
        children: ["🤠 ", restaurantInfo.name]
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xl text-stone-600 max-w-2xl mx-auto",
        children: restaurantInfo.description
      }), /* @__PURE__ */ jsx("div", {
        className: "pt-6",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/menu",
          className: "inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-emerald-700 transition-colors",
          children: "📖 Посмотреть меню"
        })
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
const menuData = [
  {
    id: 1,
    name: "Шоколадне мороженое",
    description: "Вкусное шоколадное мороженое",
    price: 100,
    image: new URL("../assets/images/choco.jpg", import.meta.url).href,
    category: "Закуски"
  },
  {
    id: 2,
    name: "Пломбир",
    description: "Классика",
    price: 120,
    image: new URL("../assets/images/plombir.jpg", import.meta.url).href,
    category: "Закуски"
  },
  {
    id: 3,
    name: "Сырное мороженое",
    description: "Нежный сырный вкус",
    price: 280,
    image: new URL("../assets/images/cheese.jpg", import.meta.url).href,
    category: "Закуски"
  },
  {
    id: 4,
    name: "Плавленное мороженое на тарелке",
    description: "Вкусно и точка.",
    price: 520,
    image: new URL("../assets/images/moroj.jpg", import.meta.url).href,
    category: "Основные блюда"
  },
  {
    id: 5,
    name: "Гречка",
    description: "Дёшево и сердито",
    price: 20,
    image: new URL("../assets/images/grechka.jpg", import.meta.url).href,
    category: "Основные блюда"
  },
  {
    id: 6,
    name: "Сырная пицца",
    description: "прикольно",
    price: 1777,
    image: new URL("../assets/images/cp.jpg", import.meta.url).href,
    category: "Основные блюда"
  },
  {
    id: 7,
    name: "Сырое мясо",
    description: "brutal",
    price: 5002,
    image: new URL("../assets/images/meat.jpg", import.meta.url).href,
    category: "Основные блюда"
  },
  {
    id: 8,
    name: "Горошница",
    description: "Гордость заведения",
    price: 1200,
    image: new URL("../assets/images/peas.jpg", import.meta.url).href,
    category: "Основные блюда"
  },
  {
    id: 9,
    name: "Десерт Павлова",
    description: "Мне не нравится",
    price: 3800,
    image: new URL("../assets/images/pavlov.jpg", import.meta.url).href,
    category: "Десерты"
  },
  {
    id: 10,
    name: "Мешок сахара",
    description: "Сладко",
    price: 3e3,
    image: new URL("../assets/images/sugar.jpg", import.meta.url).href,
    category: "Десерты"
  },
  {
    id: 11,
    name: "Сырые яйца",
    description: "Природный коктейль со всеми полезными элементами!",
    price: 60,
    image: new URL("../assets/images/eggs.jpg", import.meta.url).href,
    category: "Напитки"
  },
  {
    id: 12,
    name: "Кока-кола без сахера",
    description: "Приятность",
    price: 99,
    image: new URL("../assets/images/cola.jpg", import.meta.url).href,
    category: "Напитки"
  }
];
function MenuCard({ item, onAddToCart }) {
  return (
    // Карточка с тенью и скруглениями
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: item.image,
          alt: item.name,
          className: "w-full h-48 object-cover"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg", children: item.name }),
          /* @__PURE__ */ jsxs("span", { className: "text-red-600 font-bold", children: [
            item.price,
            " ₽"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500 mb-4", children: item.description }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onAddToCart(item),
            className: "w-full bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition-colors",
            children: "В корзину"
          }
        )
      ] })
    ] })
  );
}
function meta$3() {
  return [{
    title: "Меню | Ресторан Вандибо"
  }];
}
const menu = UNSAFE_withComponentProps(function MenuPage() {
  const categories = ["Все", "Закуски", "Основные блюда", "Десерты", "Напитки"];
  const [activeCategory, setActiveCategory] = useState("Все");
  const {
    totalCount,
    addItem
  } = useCart();
  const filteredMenu = activeCategory === "Все" ? menuData : menuData.filter((item) => item.category === activeCategory);
  const addToCart = (item) => {
    addItem(item);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "container mx-auto px-4 py-8 max-w-6xl",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex justify-between items-center mb-8",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-3xl font-bold text-stone-800",
        children: " Наше меню"
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium",
        children: ["🛒 В корзине: ", totalCount, " товаров"]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "flex gap-3 mb-8 flex-wrap",
      children: categories.map((category) => /* @__PURE__ */ jsx("button", {
        onClick: () => setActiveCategory(category),
        className: `px-4 py-2 rounded-full transition-colors ${activeCategory === category ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-700 hover:bg-stone-300"}`,
        children: category
      }, category))
    }), /* @__PURE__ */ jsx("div", {
      className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      children: filteredMenu.map((item) => /* @__PURE__ */ jsx(MenuCard, {
        item,
        onAddToCart: addToCart
      }, item.id))
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: menu,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
function meta$2() {
  return [{
    title: "Корзина | Эль Камино"
  }];
}
const cart = UNSAFE_withComponentProps(function CartPage() {
  const {
    items,
    totalAmount,
    updateQuantity
  } = useCart();
  if (items.length === 0) {
    return /* @__PURE__ */ jsxs("div", {
      className: "container mx-auto px-4 py-12 max-w-6xl text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-3xl font-bold text-stone-800 mb-4",
        children: "🛒 Корзина"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-stone-500 mb-6",
        children: "Ваша корзина пуста"
      }), /* @__PURE__ */ jsx(Link, {
        to: "/menu",
        className: "inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors",
        children: "Перейти в меню"
      })]
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "container mx-auto px-4 py-8 max-w-4xl",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-3xl font-bold text-stone-800 mb-8",
      children: "🛒 Корзина"
    }), /* @__PURE__ */ jsx("div", {
      className: "space-y-4 mb-8",
      children: items.map((item) => /* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-4 p-4 bg-stone-50 rounded-xl",
        children: [/* @__PURE__ */ jsx("img", {
          src: item.menuItem.image,
          alt: item.menuItem.name,
          className: "w-24 h-24 object-cover rounded-lg"
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex-1",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "font-bold text-stone-800 text-lg",
            children: item.menuItem.name
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-emerald-600 font-bold",
            children: [item.menuItem.price, " ₽"]
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-sm text-stone-500",
            children: ["Всего: ", item.menuItem.price * item.quantity, " ₽"]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-3",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: () => updateQuantity(item.menuItem.id, item.quantity - 1),
            className: "w-8 h-8 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors text-lg",
            children: "-"
          }), /* @__PURE__ */ jsx("span", {
            className: "font-medium w-8 text-center",
            children: item.quantity
          }), /* @__PURE__ */ jsx("button", {
            onClick: () => updateQuantity(item.menuItem.id, item.quantity + 1),
            className: "w-8 h-8 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors text-lg",
            children: "+"
          })]
        })]
      }, item.menuItem.id))
    }), /* @__PURE__ */ jsxs("div", {
      className: "bg-stone-100 rounded-2xl p-6",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex justify-between items-center mb-4",
        children: [/* @__PURE__ */ jsx("span", {
          className: "text-lg font-bold text-stone-800",
          children: "Итого:"
        }), /* @__PURE__ */ jsxs("span", {
          className: "text-2xl font-bold text-emerald-600",
          children: [totalAmount, " ₽"]
        })]
      }), /* @__PURE__ */ jsx(Link, {
        to: "/checkout",
        className: "block w-full bg-emerald-600 text-white text-center py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors",
        children: "Оформить заказ"
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cart,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
function Button({
  children,
  // содержимое
  variant = "primary",
  // вариант по умолчанию - основная
  className = "",
  // дополнительные CSS классы
  ...props
  // остальные атрибуты кнопки
}) {
  const baseClass = "px-6 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    // зеленая кнопка
    secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300"
    // серая кнопка
  };
  return /* @__PURE__ */ jsx("button", { className: `${baseClass} ${variants[variant]} ${className}`, ...props, children });
}
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;
  return (
    // Затемненный фон на весь экран
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50", onClick: onClose }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-5 border-b border-stone-200", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-stone-800", children: title }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "text-stone-400 hover:text-stone-600 text-2xl leading-none",
              children: "×"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-5", children })
      ] })
    ] })
  );
}
function meta$1() {
  return [{
    title: "Оформление заказа | Эль Камино"
  }];
}
const checkout = UNSAFE_withComponentProps(function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    totalAmount,
    clearCart
  } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  if (items.length === 0) {
    return /* @__PURE__ */ jsxs("div", {
      className: "container mx-auto px-4 py-12 max-w-6xl text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-3xl font-bold text-stone-800 mb-4",
        children: "Оформление заказа"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-stone-500 mb-6",
        children: "Корзина пуста, невозможно оформить заказ"
      }), /* @__PURE__ */ jsx(Link, {
        to: "/menu",
        className: "inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors",
        children: "Перейти в меню"
      })]
    });
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Пожалуйста, заполните имя и телефон");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsModalOpen(true);
    }, 2e3);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearCart();
    navigate("/");
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "container mx-auto px-4 py-8 max-w-4xl",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-3xl font-bold text-stone-800 mb-8",
      children: "📋 Оформление заказа"
    }), /* @__PURE__ */ jsxs("form", {
      onSubmit: handleSubmit,
      className: "space-y-6",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-stone-700 font-medium mb-2",
            children: "Ваше имя *"
          }), /* @__PURE__ */ jsx("input", {
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            className: "w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500",
            placeholder: "Даниил"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            className: "block text-stone-700 font-medium mb-2",
            children: "Телефон *"
          }), /* @__PURE__ */ jsx("input", {
            type: "tel",
            value: phone,
            onChange: (e) => setPhone(e.target.value),
            className: "w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500",
            placeholder: "+7 (999) 123-45-67"
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-stone-700 font-medium mb-2",
          children: "Комментарий к заказу"
        }), /* @__PURE__ */ jsx("textarea", {
          value: comment,
          onChange: (e) => setComment(e.target.value),
          className: "w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500",
          rows: 3,
          placeholder: "Пожелания, аллергии, особенности"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-stone-700 font-medium mb-2",
          children: "Способ оплаты"
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex gap-6",
          children: [/* @__PURE__ */ jsxs("label", {
            className: "flex items-center gap-2 cursor-pointer",
            children: [/* @__PURE__ */ jsx("input", {
              type: "radio",
              value: "card",
              checked: paymentMethod === "card",
              onChange: () => setPaymentMethod("card"),
              className: "accent-emerald-600"
            }), "💳 Картой онлайн"]
          }), /* @__PURE__ */ jsxs("label", {
            className: "flex items-center gap-2 cursor-pointer",
            children: [/* @__PURE__ */ jsx("input", {
              type: "radio",
              value: "cash",
              checked: paymentMethod === "cash",
              onChange: () => setPaymentMethod("cash"),
              className: "accent-emerald-600"
            }), "💵 Наличными"]
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "bg-stone-100 rounded-2xl p-5",
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-bold text-stone-800 mb-3",
          children: "Ваш заказ:"
        }), /* @__PURE__ */ jsx("div", {
          className: "space-y-2",
          children: items.map((item) => /* @__PURE__ */ jsxs("div", {
            className: "flex justify-between text-stone-600 py-1",
            children: [/* @__PURE__ */ jsxs("span", {
              children: [item.menuItem.name, " × ", item.quantity]
            }), /* @__PURE__ */ jsxs("span", {
              children: [item.menuItem.price * item.quantity, " ₽"]
            })]
          }, item.menuItem.id))
        }), /* @__PURE__ */ jsxs("div", {
          className: "border-t border-stone-300 mt-3 pt-3 flex justify-between font-bold text-lg",
          children: [/* @__PURE__ */ jsx("span", {
            children: "Итого:"
          }), /* @__PURE__ */ jsxs("span", {
            className: "text-emerald-700",
            children: [totalAmount, " ₽"]
          })]
        })]
      }), /* @__PURE__ */ jsx(Button, {
        type: "submit",
        disabled: isProcessing,
        className: "w-full py-4 text-lg",
        children: isProcessing ? "⏳ Обработка платежа..." : "💳 Оплатить заказ"
      })]
    }), /* @__PURE__ */ jsx(Modal, {
      isOpen: isModalOpen,
      onClose: handleCloseModal,
      title: "¡Gracias! Заказ оформлен!",
      children: /* @__PURE__ */ jsxs("div", {
        className: "text-center py-4",
        children: [/* @__PURE__ */ jsxs("p", {
          className: "text-lg text-stone-700 mb-2",
          children: ["Спасибо, ", name, "!"]
        }), /* @__PURE__ */ jsxs("p", {
          className: "text-stone-500 mb-6",
          children: ["Ваш заказ на сумму ", /* @__PURE__ */ jsxs("strong", {
            children: [totalAmount, " ₽"]
          }), " принят.", /* @__PURE__ */ jsx("br", {}), "Мы свяжемся с вами по телефону ", /* @__PURE__ */ jsx("strong", {
            children: phone
          }), " в ближайшее время."]
        }), /* @__PURE__ */ jsx(Button, {
          onClick: handleCloseModal,
          className: "w-full",
          children: "На главную"
        })]
      })
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: checkout,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function meta() {
  return [{
    title: "О нас | Ресторан Вандибо"
  }];
}
const about = UNSAFE_withComponentProps(function AboutPage() {
  return /* @__PURE__ */ jsxs("div", {
    className: "container mx-auto px-4 py-12 max-w-4xl",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "text-center mb-8",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-4xl font-bold text-stone-800 mb-4",
        children: "🇲🇽 О нашем ресторане"
      }), /* @__PURE__ */ jsxs("p", {
        className: "text-stone-500 text-lg",
        children: ["Узнайте больше о ", restaurantInfo.name]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "bg-stone-50 rounded-2xl p-8 shadow-md",
      children: [/* @__PURE__ */ jsx("div", {
        className: "aspect-video bg-stone-300 rounded-xl mb-8 flex items-center justify-center text-stone-500",
        children: "Фотография Ресторана Вандибо"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-stone-700 text-lg leading-relaxed mb-6",
        children: restaurantInfo.description
      }), /* @__PURE__ */ jsxs("div", {
        className: "border-t border-stone-200 pt-6",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-xl font-bold text-stone-800 mb-4",
          children: "Наши преимущества"
        }), /* @__PURE__ */ jsxs("ul", {
          className: "space-y-3 text-stone-600",
          children: [/* @__PURE__ */ jsxs("li", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-emerald-500 text-xl"
            }), "Аутентичные рецепты из разных регионов"]
          }), /* @__PURE__ */ jsxs("li", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-emerald-500 text-xl"
            }), "Только свежайшие продукты от проверенных поставщиков"]
          }), /* @__PURE__ */ jsxs("li", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-emerald-500 text-xl"
            }), "Атмосфера"]
          }), /* @__PURE__ */ jsxs("li", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-emerald-500 text-xl"
            }), "Лучший ресторан Новосибирска 2020-всегда"]
          }), /* @__PURE__ */ jsxs("li", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-emerald-500 text-xl"
            }), "Бесплатная доставка по городу от 200 ₽"]
          })]
        })]
      })]
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: about,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-B6saTrc7.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/root-Cdp4r389.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js", "/assets/useCart-DNcCE9qE.js", "/assets/restaurant-D55l91zW.js"], "css": ["/assets/root-D8eaY47C.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-q8t5INSd.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js", "/assets/restaurant-D55l91zW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/menu": { "id": "routes/menu", "parentId": "root", "path": "menu", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/menu-BC4Y8irE.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js", "/assets/useCart-DNcCE9qE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/cart": { "id": "routes/cart", "parentId": "root", "path": "cart", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/cart-WR1Qe-hS.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js", "/assets/useCart-DNcCE9qE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/checkout": { "id": "routes/checkout", "parentId": "root", "path": "checkout", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/checkout-Cz9L7O22.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js", "/assets/useCart-DNcCE9qE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/about": { "id": "routes/about", "parentId": "root", "path": "about", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/about-D-IaoNPo.js", "imports": ["/assets/chunk-5KNZJZUH-CyRC2OrF.js", "/assets/restaurant-D55l91zW.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-4b80b040.js", "version": "4b80b040", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "v8_passThroughRequests": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/menu": {
    id: "routes/menu",
    parentId: "root",
    path: "menu",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/cart": {
    id: "routes/cart",
    parentId: "root",
    path: "cart",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/checkout": {
    id: "routes/checkout",
    parentId: "root",
    path: "checkout",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/about": {
    id: "routes/about",
    parentId: "root",
    path: "about",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
