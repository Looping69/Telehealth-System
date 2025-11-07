import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Grid, 
  Badge,
  Tabs,
  Modal,
  NumberInput,
  Image,
  Divider,
  ActionIcon,
  Notification
} from '@mantine/core';
import { 
  IconShoppingCart, 
  IconHeart, 
  IconSearch, 
  IconFilter,
  IconPlus,
  IconMinus,
  IconCreditCard,
  IconTruck,
  IconShield,
  IconStar,
  IconPackage,
  IconClock,
  IconCheck
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { PatientCard, PatientButton, PatientTextInput, PatientSelect } from '../../../components/patient';

/**
 * PatientShop Component
 * 
 * Purpose: E-commerce platform for GLP-1 treatment supplies and wellness products
 * Features:
 * - Product catalog with categories
 * - Shopping cart functionality
 * - Order history and tracking
 * - Prescription refill ordering
 * - Wellness product recommendations
 * - Secure checkout process
 * 
 * Inputs: None (uses patient context from auth store)
 * Outputs: Renders shopping interface with product catalog and cart
 */
const PatientShop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartModalOpened, { open: openCartModal, close: closeCartModal }] = useDisclosure(false);

  // Mock product data - will be integrated with e-commerce platform
  const products = [
    {
      id: 1,
      name: 'Semaglutide Injection Pen',
      category: 'injection-supplies',
      price: 299.99,
      originalPrice: 349.99,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20injection%20pen%20for%20diabetes%20medication%20clean%20white%20background%20professional%20product%20photo&image_size=square',
      description: 'Pre-filled injection pen for weekly GLP-1 treatment',
      inStock: true,
      prescription: true,
      rating: 4.8,
      reviews: 156,
      features: ['Pre-filled', 'Easy to use', 'Weekly dosing', 'Temperature stable']
    },
    {
      id: 2,
      name: 'Digital Food Scale',
      category: 'wellness',
      price: 39.99,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20digital%20kitchen%20food%20scale%20sleek%20design%20white%20background%20product%20photography&image_size=square',
      description: 'Precision digital scale for portion control and meal planning',
      inStock: true,
      prescription: false,
      rating: 4.6,
      reviews: 89,
      features: ['Precision measurement', 'Tare function', 'Multiple units', 'Easy cleanup']
    },
    {
      id: 3,
      name: 'Blood Glucose Monitor Kit',
      category: 'monitoring',
      price: 79.99,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=blood%20glucose%20monitor%20device%20with%20test%20strips%20medical%20equipment%20clean%20background&image_size=square',
      description: 'Complete glucose monitoring system with test strips',
      inStock: true,
      prescription: false,
      rating: 4.7,
      reviews: 203,
      features: ['Fast results', 'Large display', 'Memory storage', 'Includes strips']
    },
    {
      id: 4,
      name: 'Meal Prep Containers Set',
      category: 'wellness',
      price: 24.99,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=glass%20meal%20prep%20containers%20set%20organized%20healthy%20food%20storage%20clean%20modern%20design&image_size=square',
      description: 'Glass containers for healthy meal preparation and portion control',
      inStock: true,
      prescription: false,
      rating: 4.5,
      reviews: 67,
      features: ['BPA-free glass', 'Leak-proof lids', 'Microwave safe', 'Dishwasher safe']
    },
    {
      id: 5,
      name: 'Sharps Disposal Container',
      category: 'storage',
      price: 12.99,
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20sharps%20disposal%20container%20red%20biohazard%20safety%20equipment%20healthcare%20supplies&image_size=square',
      description: 'Safe disposal container for used injection needles',
      inStock: true,
      prescription: false,
      rating: 4.9,
      reviews: 124,
      features: ['FDA approved', 'Puncture resistant', 'Locking lid', 'Proper disposal']
    }
  ];

  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-10',
      status: 'delivered',
      total: 319.98,
      estimatedDelivery: '2024-01-12',
      items: [
        { name: 'Semaglutide Injection Pen', quantity: 1, price: 299.99 },
        { name: 'Sharps Disposal Container', quantity: 1, price: 12.99 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-05',
      status: 'shipped',
      total: 64.98,
      estimatedDelivery: '2024-01-18',
      items: [
        { name: 'Digital Food Scale', quantity: 1, price: 39.99 },
        { name: 'Meal Prep Containers Set', quantity: 1, price: 24.99 }
      ]
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteProducts = products.filter(product => favorites.includes(product.id));

  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== productId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCheckout = () => {
    // TODO: Implement checkout process
    console.log('Proceeding to checkout with items:', cartItems);
    closeCartModal();
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'shipped': return 'blue';
      case 'processing': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Container size="lg" p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} mb="xs">GLP-1 Supply Shop</Title>
            <Text c="dimmed" size="sm">Order supplies and wellness products for your treatment</Text>
          </div>
          <Group gap="xs">
            <PatientButton 
              patientVariant="secondary"
              leftSection={<IconShoppingCart size="1rem" />} 
              size="sm"
              onClick={openCartModal}
            >
              Cart ({cartItems.length})
            </PatientButton>
            <PatientButton 
              patientVariant="primary"
              leftSection={<IconPackage size="1rem" />} 
              size="sm"
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </PatientButton>
          </Group>
        </Group>

        {/* Search and Filter */}
        <Group gap="md">
          <PatientTextInput
            placeholder="Search products..."
            leftSection={<IconSearch size="1rem" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <PatientSelect
            placeholder="Category"
            data={[
              { value: 'all', label: 'All Categories' },
              { value: 'injection-supplies', label: 'Injection Supplies' },
              { value: 'storage', label: 'Storage Solutions' },
              { value: 'wellness', label: 'Wellness Products' },
              { value: 'monitoring', label: 'Monitoring Tools' }
            ]}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || 'all')}
            w={200}
          />
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="products" leftSection={<IconShoppingCart size="1rem" />}>
              Products
            </Tabs.Tab>
            <Tabs.Tab value="orders" leftSection={<IconPackage size="1rem" />}>
              My Orders
            </Tabs.Tab>
            <Tabs.Tab value="favorites" leftSection={<IconHeart size="1rem" />}>
              Favorites
            </Tabs.Tab>
          </Tabs.List>

          {/* Products Tab */}
          <Tabs.Panel value="products" pt="md">
            <Grid>
              {filteredProducts.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <PatientCard
                    title={product.name}
                    description={product.description}
                    badge={product.inStock ? 
                      { text: 'IN STOCK', color: 'green', variant: 'light' } : 
                      { text: 'OUT OF STOCK', color: 'red', variant: 'light' }
                    }
                    variant="interactive"
                  >
                    <Stack gap="sm" mt="md">
                      <Image
                        src={product.image}
                        alt={product.name}
                        height={150}
                        fit="cover"
                        radius="sm"
                      />
                      
                      <Group justify="space-between" align="center">
                        <div>
                          <Text fw={600} size="lg" c="blue">${product.price}</Text>
                          {product.originalPrice && (
                            <Text size="sm" td="line-through" c="dimmed">
                              ${product.originalPrice}
                            </Text>
                          )}
                        </div>
                        <Group gap="xs">
                          <IconStar size="0.8rem" color="gold" />
                          <Text size="sm">{product.rating}</Text>
                          <Text size="xs" c="dimmed">({product.reviews})</Text>
                        </Group>
                      </Group>

                      {product.features && (
                        <Stack gap="xs">
                          {product.features.slice(0, 2).map((feature, index) => (
                            <Group key={index} gap="xs">
                              <IconCheck size="0.7rem" color="green" />
                              <Text size="xs">{feature}</Text>
                            </Group>
                          ))}
                        </Stack>
                      )}

                      <Group justify="space-between" mt="sm">
                        <ActionIcon
                          variant="light"
                          color={favorites.includes(product.id) ? 'red' : 'gray'}
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <IconHeart size="1rem" />
                        </ActionIcon>
                        <PatientButton
                          patientVariant="primary"
                          size="sm"
                          leftSection={<IconShoppingCart size="0.8rem" />}
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          style={{ flex: 1, marginLeft: '0.5rem' }}
                        >
                          Add to Cart
                        </PatientButton>
                      </Group>
                    </Stack>
                  </PatientCard>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          {/* Orders Tab */}
          <Tabs.Panel value="orders" pt="md">
            <Stack gap="md">
              {orders.map((order) => (
                <PatientCard
                  key={order.id}
                  title={`Order #${order.id}`}
                  description={`${order.items.length} items • Placed on ${order.date}`}
                  badge={{ 
                    text: order.status.toUpperCase(), 
                    color: getOrderStatusColor(order.status),
                    variant: 'light' 
                  }}
                  variant="interactive"
                >
                  <Stack gap="sm" mt="md">
                    <Group justify="space-between">
                      <Text fw={500}>Total: ${order.total}</Text>
                      <Group gap="xs">
                        <IconTruck size="0.8rem" />
                        <Text size="sm" c="dimmed">
                          {order.status === 'delivered' ? 'Delivered' : 
                           order.status === 'shipped' ? `Arrives ${order.estimatedDelivery}` :
                           'Processing'}
                        </Text>
                      </Group>
                    </Group>

                    <Divider />

                    <Stack gap="xs">
                      {order.items.slice(0, 2).map((item, index) => (
                        <Group key={index} justify="space-between">
                          <Text size="sm">{item.name} x{item.quantity}</Text>
                          <Text size="sm" fw={500}>${item.price}</Text>
                        </Group>
                      ))}
                      {order.items.length > 2 && (
                        <Text size="xs" c="dimmed">
                          +{order.items.length - 2} more items
                        </Text>
                      )}
                    </Stack>

                    <Group justify="space-between" mt="sm">
                      <PatientButton patientVariant="secondary" size="sm">
                        View Details
                      </PatientButton>
                      {order.status === 'delivered' && (
                        <PatientButton patientVariant="primary" size="sm">
                          Reorder
                        </PatientButton>
                      )}
                      {order.status === 'shipped' && (
                        <PatientButton patientVariant="primary" size="sm">
                          Track Package
                        </PatientButton>
                      )}
                    </Group>
                  </Stack>
                </PatientCard>
              ))}
            </Stack>
          </Tabs.Panel>

          {/* Favorites Tab */}
          <Tabs.Panel value="favorites" pt="md">
            <Grid>
              {favoriteProducts.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <PatientCard
                    title={product.name}
                    description={product.description}
                    badge={product.inStock ? 
                      { text: 'IN STOCK', color: 'green', variant: 'light' } : 
                      { text: 'OUT OF STOCK', color: 'red', variant: 'light' }
                    }
                    variant="interactive"
                  >
                    <Stack gap="sm" mt="md">
                      <Image
                        src={product.image}
                        alt={product.name}
                        height={120}
                        fit="cover"
                        radius="sm"
                      />
                      
                      <Group justify="space-between">
                        <Text fw={600} size="lg" c="blue">${product.price}</Text>
                        <Group gap="xs">
                          <IconStar size="0.8rem" color="gold" />
                          <Text size="sm">{product.rating}</Text>
                        </Group>
                      </Group>

                      <Group justify="space-between" mt="sm">
                        <PatientButton
                          patientVariant="secondary"
                          size="sm"
                          leftSection={<IconHeart size="0.8rem" />}
                          onClick={() => toggleFavorite(product.id)}
                        >
                          Remove
                        </PatientButton>
                        <PatientButton
                          patientVariant="primary"
                          size="sm"
                          leftSection={<IconShoppingCart size="0.8rem" />}
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                        >
                          Add to Cart
                        </PatientButton>
                      </Group>
                    </Stack>
                  </PatientCard>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>
        </Tabs>

        {/* Shopping Cart Modal */}
        <Modal opened={cartModalOpened} onClose={closeCartModal} title="Shopping Cart" size="md">
          <Stack gap="md">
            {cartItems.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                Your cart is empty
              </Text>
            ) : (
              <>
                <Stack gap="sm">
                  {cartItems.map((item) => (
                    <Group key={item.id} justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Text fw={500}>{item.name}</Text>
                        <Text size="sm" c="dimmed">${item.price} each</Text>
                      </div>
                      <Group gap="xs" align="center">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <IconMinus size="0.8rem" />
                        </ActionIcon>
                        <Text fw={500} w={30} ta="center">{item.quantity}</Text>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <IconPlus size="0.8rem" />
                        </ActionIcon>
                      </Group>
                      <Text fw={500} w={60} ta="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </Group>
                  ))}
                </Stack>

                <Divider />

                <Group justify="space-between">
                  <Text fw={600} size="lg">Total:</Text>
                  <Text fw={600} size="lg" c="blue">
                    ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </Text>
                </Group>

                <Group justify="space-between" mt="md">
                  <PatientButton patientVariant="secondary" onClick={closeCartModal}>
                    Continue Shopping
                  </PatientButton>
                  <PatientButton
                    patientVariant="primary"
                    leftSection={<IconCreditCard size="1rem" />}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </PatientButton>
                </Group>
              </>
            )}
          </Stack>
        </Modal>

        {/* Trust Indicators */}
        <Grid mt="xl">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Group gap="sm">
              <IconShield size="1.5rem" color="green" />
              <div>
                <Text fw={500} size="sm">Secure Checkout</Text>
                <Text size="xs" c="dimmed">SSL encrypted payments</Text>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Group gap="sm">
              <IconTruck size="1.5rem" color="blue" />
              <div>
                <Text fw={500} size="sm">Free Shipping</Text>
                <Text size="xs" c="dimmed">On orders over $50</Text>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Group gap="sm">
              <IconClock size="1.5rem" color="orange" />
              <div>
                <Text fw={500} size="sm">Fast Delivery</Text>
                <Text size="xs" c="dimmed">2-3 business days</Text>
              </div>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default PatientShop;