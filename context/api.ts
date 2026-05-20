// API Fetch Wrapper with Client-Side Database Fallback
// This allows the app to be fully functional on static hosting when the backend is offline.

const DEFAULT_BACKEND_URL = 'http://localhost:5000/api';

// Initial Mock Data (matching backend/seed.js)
const INITIAL_USERS = [
  { _id: 'u-admin', name: 'Artify Administrator', email: 'admin@artify.com', passwordHash: 'password123', role: 'admin' },
  { _id: 'u-customer', name: 'Rohan Sharma', email: 'customer@artify.com', passwordHash: 'password123', role: 'customer' },
  { _id: 'u-devi', name: 'Devi Prasad', email: 'devi@artify.com', passwordHash: 'password123', role: 'seller' },
  { _id: 'u-meera', name: 'Meera Devi', email: 'meera@artify.com', passwordHash: 'password123', role: 'seller' },
];

const INITIAL_SELLER_PROFILES = [
  {
    _id: 'sp-devi',
    user: 'u-devi',
    shopName: 'Khurja Clay Treasures',
    story: 'I have been practicing pottery for over 35 years in Khurja, the pottery hub of Northern India. My father taught me how to feel the consistency of clay and create magic on the pottery wheel. Each terracotta and ceramic piece is hand-kneaded, hand-spun, and fired in our local community wood-fired kiln. By buying my crafts, you support a family of five and help keep a 400-year-old pottery legacy alive.',
    location: 'Khurja, Uttar Pradesh, India',
    craftType: 'Traditional Terracotta & Glazed Ceramics',
    avatar: 'https://images.unsplash.com/photo-1565192647048-f997ed8799d3?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1595435934249-5df7ed864886?auto=format&fit=crop&w=1200&q=80',
    bankDetails: { accountHolder: 'Devi Prasad', accountNumber: '123456789012', ifscCode: 'SBIN0001234', upiId: 'deviprasad@oksbi' },
    status: 'approved',
  },
  {
    _id: 'sp-meera',
    user: 'u-meera',
    shopName: 'Jaipur Clay Sculptures & Decor',
    story: 'Welcome to Jaipur Crafts! I am Meera Devi, and I work with local women in Rajasthan to sculpt traditional clay figurines, home decor items, and painted wall hangings. We use clay harvested from local riverbeds and decorate them with organic colors, mirrors, and beads. Our shop brings the vibrant colors and rich rustic traditions of Rajasthan right into your modern home.',
    location: 'Jaipur, Rajasthan, India',
    craftType: 'Hand-painted Clay Figurines & Mirror Work',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    bankDetails: { accountHolder: 'Meera Devi', accountNumber: '987654321098', ifscCode: 'BARB0JAIPUR', upiId: 'meera@okbaroda' },
    status: 'approved',
  }
];

const INITIAL_PRODUCTS = [
  {
    _id: 'p-1',
    seller: 'u-devi',
    name: 'Rustic Terracotta Glazed Serving Bowl',
    description: 'An elegant serving bowl made from natural terracotta clay. Features a beautiful half-glazed teal finish on the inside that makes it safe for hot soups and salads, while retaining the rustic matte clay feel on the outer surface.',
    story: 'This serving bowl is thrown on a traditional hand-turned kick wheel. After air-drying for 3 days, it is hand-painted with lead-free teal glass glaze and fired at 1100°C. The process yields unique circular patterns on every bowl, making each piece singular.',
    price: 650,
    category: 'Pottery',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 12,
    rating: 5,
    numReviews: 1,
  },
  {
    _id: 'p-2',
    seller: 'u-devi',
    name: 'Earth-Toned Ceramic Coffee Mugs (Set of 2)',
    description: 'A set of two ergonomic coffee mugs glazed in a speckled beige and rich dark chocolate brown. Holds 350ml of your favorite beverage. Microwave and dishwasher safe.',
    story: 'We crafted these mugs to fit perfectly in the palm of your hand. The clay handles are pulled individually by hand and attached when the mugs are leather-hard, ensuring a sturdy and comfortable grip. The double-glaze reaction mimics mountain stone textures.',
    price: 480,
    category: 'Kitchenware',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 25,
    rating: 4,
    numReviews: 1,
  },
  {
    _id: 'p-3',
    seller: 'u-meera',
    name: 'Ganesha Clay Statue - Hand Painted',
    description: 'A meticulously hand-sculpted clay statue of Lord Ganesha, decorated with traditional Rajasthani mirror work and hand-painted with eco-friendly natural plant pigments.',
    story: 'During festive seasons, we work for weeks to prepare clay models. This Ganesha statue represents the spirit of new beginnings. It is dried in natural sunlight over 5 days, coated with white chalk, and then detailed with fine brushwork by local Rajasthani women artisans.',
    price: 1200,
    category: 'Clay Sculptures',
    images: [
      'https://images.unsplash.com/photo-1590076212953-cc729f127608?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 5,
    rating: 0,
    numReviews: 0,
  },
  {
    _id: 'p-4',
    seller: 'u-meera',
    name: 'Terracotta Floral Wall Hanging Plate',
    description: 'A decorative terracotta clay plate featuring intricate embossed floral carvings and small inlaid mirrors that capture and bounce light beautifully. Comes with a sturdy hemp hanging loop.',
    story: 'This wall plate uses the traditional block-carving style. We press a wooden block design onto raw clay, and then hand-carve the finer details. After firing, we paint it with vibrant red-ochre and attach glass mirror beads.',
    price: 850,
    category: 'Home Decor',
    images: [
      'https://images.unsplash.com/photo-1525974160448-037676e9efd3?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 8,
    rating: 0,
    numReviews: 0,
  },
  {
    _id: 'p-5',
    seller: 'u-devi',
    name: 'Handcrafted Terracotta Clay Earring Studs',
    description: 'Ultra-lightweight ceramic earring studs shaped like delicate lotus petals, glazed in a glossy terracotta orange. Hypoallergenic silver-plated backing.',
    story: 'Clay jewelry is extremely delicate to make. We slice thin pieces of terracotta clay, stamp them with organic textures, fire them in a miniature kiln, and use jewelry metal findings. Every set is incredibly lightweight and unique.',
    price: 320,
    category: 'Jewelry',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 30,
    rating: 0,
    numReviews: 0,
  }
];

const INITIAL_REVIEWS = [
  {
    _id: 'r-1',
    product: 'p-1',
    customer: 'u-customer',
    customerName: 'Rohan Sharma',
    rating: 5,
    comment: 'Absolutely stunning! You can feel the texture of the clay and the internal glaze is waterproof and very easy to clean. Using it as a salad bowl and it is a highlight on our dining table. Highly recommend supporting Devi Prasad!',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'r-2',
    product: 'p-2',
    customer: 'u-customer',
    customerName: 'Rohan Sharma',
    rating: 4,
    comment: 'Super comfy mugs. They look very organic and keep the coffee hot. One mug had a tiny glaze spot on the handle, but it just adds to the handmade feel.',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS = [
  {
    _id: 'o-1',
    customer: 'u-customer',
    items: [
      { product: 'p-1', name: 'Rustic Terracotta Glazed Serving Bowl', quantity: 1, price: 650, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80', seller: 'u-devi', status: 'processing' },
      { product: 'p-3', name: 'Ganesha Clay Statue - Hand Painted', quantity: 1, price: 1200, image: 'https://images.unsplash.com/photo-1590076212953-cc729f127608?auto=format&fit=crop&w=600&q=80', seller: 'u-meera', status: 'shipped' }
    ],
    shippingAddress: { address: 'Flat 402, Sunshine Heights, MG Road', city: 'New Delhi', postalCode: '110001', country: 'India' },
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    totalAmount: 1850,
    createdAt: new Date().toISOString()
  }
];

// Helper to get/set localStorage items
const getStorageItem = (key: string, initial: any) => {
  if (typeof window === 'undefined') return initial;
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(val);
  } catch {
    return initial;
  }
};

const setStorageItem = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Main Mock Database API Handler
const handleMockRequest = (path: string, options?: RequestInit): { success: boolean; [key: string]: any } => {
  const urlPath = path.split('?')[0];
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : null;
  const headers = options?.headers as Record<string, string> || {};
  const token = headers['Authorization']?.split(' ')[1] || (typeof window !== 'undefined' ? localStorage.getItem('artify_token') : null);

  // Initialize DB collections
  const users = getStorageItem('db_users', INITIAL_USERS);
  const profiles = getStorageItem('db_seller_profiles', INITIAL_SELLER_PROFILES);
  const products = getStorageItem('db_products', INITIAL_PRODUCTS);
  const reviews = getStorageItem('db_reviews', INITIAL_REVIEWS);
  const orders = getStorageItem('db_orders', INITIAL_ORDERS);

  // Find currently logged-in user from token
  let currentUser = null;
  if (token) {
    currentUser = users.find((u: any) => u._id === token || u.email === token);
  }

  // --- ROUTING IMPLEMENTATION ---

  // Auth: Me
  if (urlPath === '/auth/me') {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    const sellerProfile = profiles.find((p: any) => p.user === currentUser._id);
    return {
      success: true,
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        sellerStatus: sellerProfile ? sellerProfile.status : null
      }
    };
  }

  // Auth: Login
  if (urlPath === '/auth/login' && method === 'POST') {
    const { email, password } = body || {};
    const user = users.find((u: any) => u.email === email && u.passwordHash === password);
    if (!user) return { success: false, error: 'Invalid email or password' };
    const sellerProfile = profiles.find((p: any) => p.user === user._id);
    return {
      success: true,
      token: user._id, // Use User ID as mock token
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerStatus: sellerProfile ? sellerProfile.status : null
      }
    };
  }

  // Auth: Register
  if (urlPath === '/auth/register' && method === 'POST') {
    const { name, email, password, role } = body || {};
    if (users.some((u: any) => u.email === email)) {
      return { success: false, error: 'User already exists with this email' };
    }
    const newUser = {
      _id: `u-${Date.now()}`,
      name,
      email,
      passwordHash: password,
      role
    };
    users.push(newUser);
    setStorageItem('db_users', users);

    // Auto create seller profile if registering as a seller
    if (role === 'seller') {
      const newProfile = {
        _id: `sp-${Date.now()}`,
        user: newUser._id,
        shopName: `${name}'s Craft Studio`,
        story: 'Welcome to my shop. I handcraft beautiful organic products locally.',
        location: 'Local Artisan Hub',
        craftType: 'Handmade Crafts',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        bankDetails: { accountHolder: name, accountNumber: '', ifscCode: '', upiId: '' },
        status: 'pending' // Admin must approve
      };
      profiles.push(newProfile);
      setStorageItem('db_seller_profiles', profiles);
    }

    return {
      success: true,
      token: newUser._id,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        sellerStatus: role === 'seller' ? 'pending' : null
      }
    };
  }

  // Products: Get All (with search and filters)
  if (urlPath === '/products' && method === 'GET') {
    const urlParams = new URL(path, 'http://localhost');
    const keyword = urlParams.searchParams.get('keyword');
    const category = urlParams.searchParams.get('category');
    const minPrice = Number(urlParams.searchParams.get('minPrice')) || 0;
    const maxPrice = Number(urlParams.searchParams.get('maxPrice')) || Infinity;
    const sort = urlParams.searchParams.get('sort') || 'latest';
    const limit = Number(urlParams.searchParams.get('limit')) || Infinity;

    let filtered = [...products];

    // Filter by keyword
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter((p: any) => 
        p.name.toLowerCase().includes(kw) || 
        p.description.toLowerCase().includes(kw)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter((p: any) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by price
    filtered = filtered.filter((p: any) => p.price >= minPrice && p.price <= maxPrice);

    // Sorting
    if (sort === 'priceAsc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // latest
      filtered.reverse();
    }

    return {
      success: true,
      products: filtered.slice(0, limit)
    };
  }

  // Products: Get Single Product by ID
  if (urlPath.startsWith('/products/') && method === 'GET') {
    const id = urlPath.split('/products/')[1];
    const product = products.find((p: any) => p._id === id);
    if (!product) return { success: false, error: 'Product not found' };

    // Fetch reviews for this product
    const prodReviews = reviews.filter((r: any) => r.product === id);
    
    // Fetch seller user and seller profile
    const sellerUser = users.find((u: any) => u._id === product.seller);
    const sellerProfile = profiles.find((p: any) => p.user === product.seller);

    return {
      success: true,
      product: {
        ...product,
        seller: {
          _id: sellerUser?._id || product.seller,
          name: sellerUser?.name || 'Local Artisan',
          shopName: sellerProfile?.shopName || 'Artisan Workshop',
          story: sellerProfile?.story || '',
          location: sellerProfile?.location || '',
          avatar: sellerProfile?.avatar || ''
        }
      },
      reviews: prodReviews
    };
  }

  // Products: Create New Product (Seller Only)
  if (urlPath === '/products' && method === 'POST') {
    if (!currentUser || currentUser.role !== 'seller') {
      return { success: false, error: 'Not authorized as seller' };
    }
    const { name, description, story, price, category, images, stock } = body || {};
    const newProduct = {
      _id: `p-${Date.now()}`,
      seller: currentUser._id,
      name,
      description,
      story,
      price: Number(price),
      category,
      images: images || ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80'],
      stock: Number(stock),
      rating: 0,
      numReviews: 0
    };
    products.push(newProduct);
    setStorageItem('db_products', products);

    return { success: true, product: newProduct };
  }

  // Products: Delete Product
  if (urlPath.startsWith('/products/') && method === 'DELETE') {
    if (!currentUser || currentUser.role !== 'seller') {
      return { success: false, error: 'Not authorized' };
    }
    const id = urlPath.split('/products/')[1];
    const productIndex = products.findIndex((p: any) => p._id === id && p.seller === currentUser._id);
    if (productIndex === -1) return { success: false, error: 'Product not found or not owned by you' };

    products.splice(productIndex, 1);
    setStorageItem('db_products', products);
    return { success: true };
  }

  // Reviews: Add Review
  if (urlPath === '/reviews' && method === 'POST') {
    if (!currentUser) return { success: false, error: 'Login required' };
    const { product: productId, rating, comment } = body || {};
    
    const newReview = {
      _id: `r-${Date.now()}`,
      product: productId,
      customer: currentUser._id,
      customerName: currentUser.name,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    setStorageItem('db_reviews', reviews);

    // Update product rating average
    const prodProducts = products.find((p: any) => p._id === productId);
    if (prodProducts) {
      const prodReviews = reviews.filter((r: any) => r.product === productId);
      const totalRating = prodReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      prodProducts.rating = Math.round((totalRating / prodReviews.length) * 10) / 10;
      prodProducts.numReviews = prodReviews.length;
      setStorageItem('db_products', products);
    }

    return { success: true, review: newReview };
  }

  // Orders: Create Order (Checkout)
  if (urlPath === '/orders' && method === 'POST') {
    if (!currentUser) return { success: false, error: 'Login required' };
    const { items, shippingAddress, paymentMethod, paymentStatus, totalAmount } = body || {};

    const newOrder = {
      _id: `o-${Date.now()}`,
      customer: currentUser._id,
      items: items.map((item: any) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        seller: item.seller,
        status: 'processing'
      })),
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      totalAmount,
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    setStorageItem('db_orders', orders);

    // Decrement product stock levels
    items.forEach((item: any) => {
      const prod = products.find((p: any) => p._id === item.product);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    setStorageItem('db_products', products);

    return { success: true, order: newOrder };
  }

  // Orders: Get Customer Orders
  if (urlPath === '/orders/my-orders' && method === 'GET') {
    if (!currentUser) return { success: false, error: 'Login required' };
    const userOrders = orders.filter((o: any) => o.customer === currentUser._id);
    return { success: true, orders: userOrders };
  }

  // Orders: Get Seller Orders
  if (urlPath === '/orders/seller-orders' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'seller') {
      return { success: false, error: 'Not authorized' };
    }

    // Filter order items that belong to this seller
    const sellerOrders = orders.filter((o: any) => 
      o.items.some((item: any) => item.seller === currentUser._id)
    ).map((o: any) => ({
      ...o,
      items: o.items.filter((item: any) => item.seller === currentUser._id)
    }));

    return { success: true, orders: sellerOrders };
  }

  // Orders: Update Order Item Shipment Status (Seller Only)
  if (urlPath.includes('/orders/') && urlPath.includes('/item/') && method === 'PUT') {
    if (!currentUser || currentUser.role !== 'seller') {
      return { success: false, error: 'Not authorized' };
    }
    // Path format: /orders/:orderId/item/:productId
    const parts = urlPath.split('/');
    const orderId = parts[2];
    const productId = parts[4];
    const { status: newStatus } = body || {};

    const order = orders.find((o: any) => o._id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const item = order.items.find((i: any) => i.product === productId && i.seller === currentUser._id);
    if (!item) return { success: false, error: 'Order item not found' };

    item.status = newStatus;
    setStorageItem('db_orders', orders);

    return { success: true, order };
  }

  // Seller Profile: Get Logged In Profile
  if (urlPath === '/sellers/profile' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'seller') {
      return { success: false, error: 'Not authorized' };
    }
    const profile = profiles.find((p: any) => p.user === currentUser._id);
    if (!profile) return { success: false, error: 'Profile not found' };
    return { success: true, profile };
  }

  // Seller Profile: Update Profile
  if (urlPath === '/sellers/profile' && method === 'PUT') {
    if (!currentUser || currentUser.role !== 'seller') {
      return { success: false, error: 'Not authorized' };
    }
    const profile = profiles.find((p: any) => p.user === currentUser._id);
    if (!profile) return { success: false, error: 'Profile not found' };

    const { shopName, story, location, craftType, avatar, banner, bankDetails } = body || {};
    profile.shopName = shopName || profile.shopName;
    profile.story = story || profile.story;
    profile.location = location || profile.location;
    profile.craftType = craftType || profile.craftType;
    profile.avatar = avatar || profile.avatar;
    profile.banner = banner || profile.banner;
    profile.bankDetails = bankDetails || profile.bankDetails;

    setStorageItem('db_seller_profiles', profiles);
    return { success: true, profile };
  }

  // Seller Profile: Get Public Profile by ID
  if (urlPath.startsWith('/sellers/profile/') && method === 'GET') {
    const id = urlPath.split('/sellers/profile/')[1];
    
    // Check if id matches seller user id OR profile id
    const profile = profiles.find((p: any) => p.user === id || p._id === id);
    if (!profile) return { success: false, error: 'Artisan profile not found' };

    const sellerUser = users.find((u: any) => u._id === profile.user);
    const sellerProducts = products.filter((p: any) => p.seller === profile.user);

    return {
      success: true,
      profile: {
        ...profile,
        name: sellerUser?.name || 'Local Artisan',
        email: sellerUser?.email || ''
      },
      products: sellerProducts
    };
  }

  // Admin: Get Users
  if (urlPath === '/admin/users' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }
    return { success: true, users };
  }

  // Admin: Update User Role
  if (urlPath.startsWith('/admin/users/') && urlPath.endsWith('/role') && method === 'PUT') {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }
    const id = urlPath.split('/admin/users/')[1].split('/role')[0];
    const { role } = body || {};

    const user = users.find((u: any) => u._id === id);
    if (!user) return { success: false, error: 'User not found' };

    user.role = role;
    setStorageItem('db_users', users);
    return { success: true, user };
  }

  // Admin: Get Seller Registration Queue
  if (urlPath === '/admin/sellers' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }

    // Populate seller profiles with user info
    const populated = profiles.map((p: any) => {
      const u = users.find((usr: any) => usr._id === p.user);
      return {
        ...p,
        user: {
          _id: p.user,
          name: u?.name || 'Artisan',
          email: u?.email || ''
        }
      };
    });

    return { success: true, sellers: populated };
  }

  // Admin: Update Seller Approval Status
  if (urlPath.startsWith('/admin/sellers/') && urlPath.endsWith('/status') && method === 'PUT') {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }
    const id = urlPath.split('/admin/sellers/')[1].split('/status')[0];
    const { status } = body || {};

    // Search by profile ID
    const profile = profiles.find((p: any) => p._id === id);
    if (!profile) return { success: false, error: 'Seller profile not found' };

    profile.status = status;
    setStorageItem('db_seller_profiles', profiles);

    return { success: true, profile };
  }

  // Admin: Analytics & Reports
  if (urlPath === '/admin/analytics' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Not authorized' };
    }

    const totalSales = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    const activeArtisans = profiles.filter((p: any) => p.status === 'approved').length;
    const pendingApprovals = profiles.filter((p: any) => p.status === 'pending').length;
    
    // Group sales by category
    const categorySales: Record<string, number> = {};
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const prod = products.find((p: any) => p._id === item.product);
        const cat = prod?.category || 'Other';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });
    });

    const categoryReport = Object.keys(categorySales).map(name => ({
      name,
      value: categorySales[name]
    }));

    return {
      success: true,
      analytics: {
        totalSales,
        totalOrders: orders.length,
        totalProducts: products.length,
        activeArtisans,
        pendingApprovals,
        categoryReport
      }
    };
  }

  return { success: false, error: 'Endpoint not supported in mock database mode' };
};

// Main API request caller: tries network first, falls back to client-side localStorage DB
export const apiRequest = async (path: string, options?: RequestInit): Promise<any> => {
  const backendBaseUrl = typeof window !== 'undefined'
    ? (window.localStorage.getItem('artify_backend_url') || process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL)
    : DEFAULT_BACKEND_URL;

  try {
    // Attempt real backend call
    const res = await fetch(`${backendBaseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
        // Auto attach auth token
        ...(typeof window !== 'undefined' && localStorage.getItem('artify_token')
          ? { Authorization: `Bearer ${localStorage.getItem('artify_token')}` }
          : {}),
      }
    });

    // If server returned a response, convert to json and return
    const data = await res.json();
    return data;
  } catch (error) {
    // Connection or network failed ➔ fall back to client-side mock database
    console.warn(`⚠️ Connection to API server at ${backendBaseUrl} failed. Falling back to local Client-Side Database.`, error);
    
    // Simulate server delay in browser
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return handleMockRequest(path, options);
  }
};
