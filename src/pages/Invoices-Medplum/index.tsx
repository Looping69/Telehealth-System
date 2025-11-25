/**
 * Invoices-Medplum Page Component
 * Manages invoices using FHIR data with the design from the main Invoices page
 */

import React, { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Button,
  TextInput,
  Select,
  ActionIcon,
  Modal,
  Tabs,
  Table,
  NumberInput,
  Divider,
  Center,
  Loader,
  Progress,
  Alert,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Send,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Invoice } from '@medplum/fhirtypes';
import { useInvoices, useCreateInvoice, useUpdateInvoice } from '../../hooks/useQuery';

/**
 * Helper to normalize FHIR Invoice to UI-friendly structure
 */
const normalizeInvoice = (invoice: Invoice) => {
  const amount = invoice.totalNet?.value || invoice.totalGross?.value || 0;
  const status = invoice.status || 'draft';
  const createdAt = new Date(invoice.date || invoice.meta?.lastUpdated || Date.now());
  // Estimate due date (e.g., 30 days after creation if not present)
  const dueDate = invoice.paymentTerms ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const patientName = invoice.subject?.display || 'Unknown Patient';
  const patientId = invoice.subject?.reference?.split('/')[1] || 'Unknown';

  // Map FHIR status to UI status
  let uiStatus: 'paid' | 'sent' | 'overdue' | 'draft' | 'cancelled' = 'draft';
  if (status === 'balanced') uiStatus = 'paid';
  else if (status === 'issued') {
    uiStatus = dueDate < new Date() ? 'overdue' : 'sent';
  } else if (status === 'cancelled' || status === 'entered-in-error') {
    uiStatus = 'cancelled';
  } else {
    uiStatus = 'draft';
  }

  return {
    id: invoice.id || '',
    patientId,
    patientName,
    amount,
    status: uiStatus,
    fhirStatus: status,
    createdAt,
    dueDate,
    items: invoice.lineItem?.map((item, idx) => ({
      id: item.id || `item-${idx}`,
      description: item.chargeItemCodeableConcept?.text || item.chargeItemReference?.display || 'Service',
      quantity: item.priceComponent?.[0]?.factor || 1,
      unitPrice: item.priceComponent?.[0]?.amount?.value || 0,
      total: (item.priceComponent?.[0]?.amount?.value || 0) * (item.priceComponent?.[0]?.factor || 1)
    })) || []
  };
};

type NormalizedInvoice = ReturnType<typeof normalizeInvoice>;

/**
 * Invoice Table Row Component
 */
interface InvoiceTableRowProps {
  invoice: NormalizedInvoice;
  onView: (invoice: NormalizedInvoice) => void;
  onEdit: (invoice: NormalizedInvoice) => void;
  onSend?: (invoice: NormalizedInvoice) => void;
}

const InvoiceTableRow: React.FC<InvoiceTableRowProps> = ({ invoice, onView, onEdit, onSend }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'sent': return 'yellow';
      case 'overdue': return 'red';
      case 'draft': return 'gray';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Table.Tr style={{ backgroundColor: invoice.status === 'overdue' ? '#fff5f5' : undefined }}>
      <Table.Td>
        <Stack gap={4}>
          <Text fw={500}>{invoice.id}</Text>
          <Text size="sm" c="dimmed">Patient: {invoice.patientName}</Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text fw={700} c="blue">${invoice.amount.toFixed(2)}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(invoice.status)}>
          {invoice.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{invoice.createdAt.toLocaleDateString()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={invoice.status === 'overdue' ? 'red' : undefined}>
          {invoice.dueDate.toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">Credit Card</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="light" color="blue" size="sm" onClick={() => onView(invoice)}>
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon variant="light" color="orange" size="sm" onClick={() => onEdit(invoice)}>
            <Edit size={14} />
          </ActionIcon>
          <ActionIcon variant="light" color="gray" size="sm">
            <Download size={14} />
          </ActionIcon>
          {invoice.status === 'draft' && onSend && (
            <ActionIcon variant="light" color="green" size="sm" onClick={() => onSend(invoice)}>
              <Send size={14} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Invoice Card Component
 */
interface InvoiceCardProps {
  invoice: NormalizedInvoice;
  onView: (invoice: NormalizedInvoice) => void;
  onEdit: (invoice: NormalizedInvoice) => void;
  onSend?: (invoice: NormalizedInvoice) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onView, onEdit, onSend }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'sent': return 'yellow';
      case 'overdue': return 'red';
      case 'draft': return 'gray';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} />;
      case 'sent': return <Clock size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="xs">
              <Text fw={500} size="lg">{invoice.id}</Text>
              <Badge size="xs" color="green" variant="light">FHIR</Badge>
            </Group>
            <Text size="sm" c="dimmed">Patient: {invoice.patientName}</Text>
          </Stack>
          <Badge
            color={getStatusColor(invoice.status)}
            leftSection={getStatusIcon(invoice.status)}
          >
            {invoice.status}
          </Badge>
        </Group>

        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text size="xl" fw={700} c="blue">${invoice.amount.toFixed(2)}</Text>
            <Text size="xs" c="dimmed">Due: {invoice.dueDate.toLocaleDateString()}</Text>
          </Stack>
          {invoice.status === 'overdue' && (
            <Badge color="red" size="sm">Overdue</Badge>
          )}
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Issued: {invoice.createdAt.toLocaleDateString()}</Text>
          </Group>
          <Group gap="xs">
            <CreditCard size={14} />
            <Text size="sm">Credit Card</Text>
          </Group>
        </Stack>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {invoice.items.map(i => i.description).join(', ') || 'Standard consultation'}
        </Text>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ActionIcon variant="light" color="blue" onClick={() => onView(invoice)}>
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon variant="light" color="orange" onClick={() => onEdit(invoice)}>
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon variant="light" color="gray">
              <Download size={16} />
            </ActionIcon>
          </Group>
          {invoice.status === 'draft' && onSend && (
            <Button size="xs" leftSection={<Send size={14} />} onClick={() => onSend(invoice)}>
              Send
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Invoice Details Modal
 */
interface InvoiceDetailsModalProps {
  invoice: NormalizedInvoice | null;
  opened: boolean;
  onClose: () => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, opened, onClose }) => {
  if (!invoice) return null;

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <Modal opened={opened} onClose={onClose} title={`Invoice ${invoice.id}`} size="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={3}>{invoice.id}</Title>
            <Text c="dimmed">Patient: {invoice.patientName}</Text>
          </Stack>
          <Badge color={invoice.status === 'paid' ? 'green' : 'yellow'} size="lg">
            {invoice.status}
          </Badge>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Invoice Information</Text>
              <Text size="sm"><strong>Issue Date:</strong> {invoice.createdAt.toLocaleDateString()}</Text>
              <Text size="sm"><strong>Due Date:</strong> {invoice.dueDate.toLocaleDateString()}</Text>
              <Text size="sm"><strong>Payment Method:</strong> Credit Card</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Amount</Text>
              <Text size="xl" fw={700} c="blue">${invoice.amount.toFixed(2)}</Text>
            </Stack>
          </Grid.Col>
        </Grid>

        <Stack gap="xs">
          <Text fw={500}>Items</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Description</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Unit Price</Table.Th>
                <Table.Th>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoice.items.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.description}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>${item.unitPrice.toFixed(2)}</Table.Td>
                  <Table.Td>${item.total.toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Stack gap="xs" mt="md">
            <Group justify="space-between">
              <Text>Subtotal:</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </Group>
            <Group justify="space-between">
              <Text>Tax (8%):</Text>
              <Text>${tax.toFixed(2)}</Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text fw={700}>Total:</Text>
              <Text fw={700} size="lg">${total.toFixed(2)}</Text>
            </Group>
          </Stack>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Close</Button>
          <Button leftSection={<Download size={16} />}>Download PDF</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Create Invoice Modal
 */
interface CreateInvoiceModalProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (invoice: any) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ opened, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    dueDate: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: '', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { id: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const amount = items.reduce((sum, item) => sum + item.total, 0);

    onCreate({
      patientId: formData.patientId,
      dueDate: formData.dueDate,
      notes: formData.notes,
      description: items[0]?.description || 'Medical Services',
      amount,
      lineItems: items
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Invoice" size="xl">
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Patient ID"
              placeholder="Enter patient ID"
              value={formData.patientId}
              onChange={(event) => setFormData({ ...formData, patientId: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(event) => setFormData({ ...formData, dueDate: event.currentTarget.value })}
              required
            />
          </Grid.Col>
        </Grid>

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text fw={500}>Invoice Items</Text>
            <Button size="xs" onClick={addItem}>Add Item</Button>
          </Group>

          {items.map((item, index) => (
            <Card key={index} padding="sm" withBorder>
              <Grid align="end">
                <Grid.Col span={4}>
                  <TextInput
                    label="Description"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(event) => updateItem(index, 'description', event.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Quantity"
                    value={item.quantity}
                    onChange={(value) => updateItem(index, 'quantity', value || 1)}
                    min={1}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Unit Price"
                    value={item.unitPrice}
                    onChange={(value) => updateItem(index, 'unitPrice', value || 0)}
                    min={0}
                    decimalScale={2}
                    prefix="$"
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Total"
                    value={item.total}
                    readOnly
                    decimalScale={2}
                    prefix="$"
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <Button color="red" variant="light" size="xs" onClick={() => removeItem(index)} disabled={items.length === 1}>
                    Remove
                  </Button>
                </Grid.Col>
              </Grid>
            </Card>
          ))}
        </Stack>

        <TextInput
          label="Notes"
          placeholder="Additional notes (optional)"
          value={formData.notes}
          onChange={(event) => setFormData({ ...formData, notes: event.currentTarget.value })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Invoice</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Edit Invoice Modal
 */
interface EditInvoiceModalProps {
  invoice: NormalizedInvoice | null;
  opened: boolean;
  onClose: () => void;
  onSave: (updatedInvoice: any) => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ invoice, opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    dueDate: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: '', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);

  React.useEffect(() => {
    if (invoice) {
      setFormData({
        patientId: invoice.patientId,
        dueDate: invoice.dueDate.toISOString().split('T')[0],
        notes: '',
      });
      setItems(invoice.items.length ? invoice.items : [{ id: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  }, [invoice]);

  const addItem = () => {
    setItems([...items, { id: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (!invoice) return;
    onSave({ ...invoice, items, amount: calculateTotal() });
    showNotification({ title: 'Success', message: 'Invoice updated successfully', color: 'green' });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Invoice" size="xl">
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Patient ID"
              placeholder="Enter patient ID"
              value={formData.patientId}
              onChange={(event) => setFormData({ ...formData, patientId: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(event) => setFormData({ ...formData, dueDate: event.currentTarget.value })}
              required
            />
          </Grid.Col>
        </Grid>

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text fw={500}>Invoice Items</Text>
            <Button size="xs" onClick={addItem}>Add Item</Button>
          </Group>

          {items.map((item, index) => (
            <Card key={index} padding="sm" withBorder>
              <Grid align="end">
                <Grid.Col span={4}>
                  <TextInput
                    label="Description"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(event) => updateItem(index, 'description', event.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Quantity"
                    value={item.quantity}
                    onChange={(value) => updateItem(index, 'quantity', value || 1)}
                    min={1}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Unit Price"
                    value={item.unitPrice}
                    onChange={(value) => updateItem(index, 'unitPrice', value || 0)}
                    min={0}
                    decimalScale={2}
                    prefix="$"
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Total"
                    value={item.total}
                    readOnly
                    decimalScale={2}
                    prefix="$"
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <Button color="red" variant="light" size="xs" onClick={() => removeItem(index)} disabled={items.length === 1}>
                    Remove
                  </Button>
                </Grid.Col>
              </Grid>
            </Card>
          ))}
        </Stack>

        <Group justify="space-between" mt="md">
          <Text fw={500} size="lg">Total: ${calculateTotal().toFixed(2)}</Text>
          <Group>
            <Button variant="light" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Update Invoice</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Invoices-Medplum Page Component
 */
const InvoicesMedplumPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedInvoice, setSelectedInvoice] = useState<NormalizedInvoice | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editingInvoice, setEditingInvoice] = useState<NormalizedInvoice | null>(null);

  // Fetch data from Medplum
  const {
    data: fhirInvoices = [],
    isLoading,
    error,
    isError
  } = useInvoices({
    search: searchQuery,
    // We fetch all and filter client-side for tabs, or we could pass status to hook
    // For now, let's fetch all to support client-side tab filtering easily
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Normalize data
  const invoices = useMemo(() => fhirInvoices.map(normalizeInvoice), [fhirInvoices]);

  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  const handleCreateInvoice = (invoiceData: any) => {
    createInvoiceMutation.mutate(invoiceData, {
      onSuccess: () => {
        showNotification({ title: 'Success', message: 'Invoice created successfully', color: 'green' });
        closeCreate();
      },
      onError: (error) => {
        showNotification({ title: 'Error', message: 'Failed to create invoice', color: 'red' });
      }
    });
  };

  const handleViewInvoice = (invoice: NormalizedInvoice) => {
    setSelectedInvoice(invoice);
    openDetails();
  };

  const handleEditInvoice = (invoice: NormalizedInvoice) => {
    setEditingInvoice(invoice);
    openEdit();
  };

  const handleSendInvoice = (invoice: NormalizedInvoice) => {
    if (invoice.status !== 'draft') {
      showNotification({ title: 'Error', message: 'Only draft invoices can be sent', color: 'red' });
      return;
    }

    updateInvoiceMutation.mutate({ id: invoice.id, status: 'issued' }, {
      onSuccess: () => {
        showNotification({ title: 'Success', message: 'Invoice sent successfully', color: 'green' });
      },
      onError: () => {
        showNotification({ title: 'Error', message: 'Failed to send invoice', color: 'red' });
      }
    });
  };

  const handleSaveEditedInvoice = (updatedInvoice: any) => {
    updateInvoiceMutation.mutate(updatedInvoice, {
      onSuccess: () => {
        showNotification({ title: 'Success', message: 'Invoice updated successfully', color: 'green' });
        closeEdit();
      },
      onError: () => {
        showNotification({ title: 'Error', message: 'Failed to update invoice', color: 'red' });
      }
    });
  };

  const filterInvoicesByTab = (invoices: NormalizedInvoice[], tab: string) => {
    switch (tab) {
      case 'paid': return invoices.filter(invoice => invoice.status === 'paid');
      case 'pending': return invoices.filter(invoice => invoice.status === 'sent');
      case 'overdue': return invoices.filter(invoice => invoice.status === 'overdue');
      case 'draft': return invoices.filter(invoice => invoice.status === 'draft');
      default: return invoices;
    }
  };

  const filteredInvoices = filterInvoicesByTab(invoices, activeTab || 'all')
    .filter(invoice =>
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(invoice => !statusFilter || invoice.status === statusFilter);

  // Calculate summary statistics
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices.filter(invoice => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices.filter(invoice => invoice.status === 'sent').reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = invoices.filter(invoice => invoice.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Invoices & Billing</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage patient billing and payment processing</Text>
            </Group>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Invoice
          </Button>
        </Group>

        {/* Error Alert */}
        {isError && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error?.message || 'Failed to fetch invoices.'}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Revenue</Text>
                <ActionIcon variant="light" color="blue" size="lg"><DollarSign size={20} /></ActionIcon>
              </Group>
              <Text fw={700} size="xl" mb="xs">${totalAmount.toFixed(2)}</Text>
              <Progress value={100} color="blue" size="sm" />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Paid</Text>
                <ActionIcon variant="light" color="green" size="lg"><CheckCircle size={20} /></ActionIcon>
              </Group>
              <Text fw={700} size="xl" mb="xs" c="green">${paidAmount.toFixed(2)}</Text>
              <Progress value={totalAmount ? (paidAmount / totalAmount) * 100 : 0} color="green" size="sm" />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Pending</Text>
                <ActionIcon variant="light" color="yellow" size="lg"><Clock size={20} /></ActionIcon>
              </Group>
              <Text fw={700} size="xl" mb="xs" c="yellow">${pendingAmount.toFixed(2)}</Text>
              <Progress value={totalAmount ? (pendingAmount / totalAmount) * 100 : 0} color="yellow" size="sm" />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Overdue</Text>
                <ActionIcon variant="light" color="red" size="lg"><AlertCircle size={20} /></ActionIcon>
              </Group>
              <Text fw={700} size="xl" mb="xs" c="red">${overdueAmount.toFixed(2)}</Text>
              <Progress value={totalAmount ? (overdueAmount / totalAmount) * 100 : 0} color="red" size="sm" />
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search invoices..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'draft', label: 'Draft' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Button.Group>
                <Button variant={viewMode === 'cards' ? 'filled' : 'light'} onClick={() => setViewMode('cards')} size="sm">Cards</Button>
                <Button variant={viewMode === 'table' ? 'filled' : 'light'} onClick={() => setViewMode('table')} size="sm">Table</Button>
              </Button.Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<FileText size={16} />}>All Invoices</Tabs.Tab>
            <Tabs.Tab value="pending" leftSection={<Clock size={16} />}>Sent</Tabs.Tab>
            <Tabs.Tab value="paid" leftSection={<CheckCircle size={16} />}>Paid</Tabs.Tab>
            <Tabs.Tab value="overdue" leftSection={<AlertCircle size={16} />}>Overdue</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={activeTab || 'all'} pt="md">
            {isLoading ? (
              <Center py="xl"><Loader size="lg" /></Center>
            ) : filteredInvoices.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <DollarSign size={48} color="gray" />
                  <Text size="lg" c="dimmed">No invoices found</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {searchQuery || statusFilter ? 'Try adjusting your search criteria' : 'Get started by creating your first invoice'}
                  </Text>
                  <Button leftSection={<Plus size={16} />} onClick={openCreate}>Create Invoice</Button>
                </Stack>
              </Center>
            ) : viewMode === 'cards' ? (
              <Grid>
                {filteredInvoices.map((invoice) => (
                  <Grid.Col key={invoice.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <InvoiceCard
                      invoice={invoice}
                      onView={handleViewInvoice}
                      onEdit={handleEditInvoice}
                      onSend={handleSendInvoice}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Invoice</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Issue Date</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Payment Method</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredInvoices.map((invoice) => (
                      <InvoiceTableRow
                        key={invoice.id}
                        invoice={invoice}
                        onView={handleViewInvoice}
                        onEdit={handleEditInvoice}
                        onSend={handleSendInvoice}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modals */}
      <InvoiceDetailsModal invoice={selectedInvoice} opened={detailsOpened} onClose={closeDetails} />
      <CreateInvoiceModal opened={createOpened} onClose={closeCreate} onCreate={handleCreateInvoice} />
      <EditInvoiceModal invoice={editingInvoice} opened={editOpened} onClose={closeEdit} onSave={handleSaveEditedInvoice} />
    </Container>
  );
};

export default InvoicesMedplumPage;