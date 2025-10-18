/**
 * Invoices-Medplum Page Component
 * Manages invoices using FHIR data with proper hooks integration
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
  Center,
  Loader,
  Alert,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Receipt,
  DollarSign,
  Calendar,
  User,
  Filter,
  Database,
  AlertCircle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { Invoice } from '@medplum/fhirtypes';
import { useInvoices } from '../../hooks/useQuery';
import { CreateInvoiceModal } from '../../components/CreateInvoiceModal';

/**
 * FHIR Invoice Card Component
 */
interface FHIRInvoiceCardProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
}

const FHIRInvoiceCard: React.FC<FHIRInvoiceCardProps> = ({ invoice, onView, onEdit }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'issued':
        return 'blue';
      case 'balanced':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPatientName = () => {
    return invoice.subject?.display || 'Unknown Patient';
  };

  const getTotalAmount = () => {
    return invoice.totalNet?.value ? `$${invoice.totalNet.value.toFixed(2)}` : 'N/A';
  };

  const getInvoiceDate = () => {
    return invoice.date ? new Date(invoice.date).toLocaleDateString() : 'Unknown date';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Invoice
            </Badge>
          </Group>
          <Badge color={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </Group>

        <Group>
          <ActionIcon variant="light" color="blue" size="lg">
            <Receipt size={20} />
          </ActionIcon>
          <Stack gap={4}>
            <Text fw={500}>Invoice #{invoice.id}</Text>
            <Text size="sm" c="dimmed">
              {getPatientName()}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <DollarSign size={14} />
            <Text size="sm">Amount: {getTotalAmount()}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Date: {getInvoiceDate()}</Text>
          </Group>
          <Group gap="xs">
            <User size={14} />
            <Text size="sm">Patient: {getPatientName()}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            Type: {invoice.type?.text || 'Standard'}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(invoice)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(invoice)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Main Invoices-Medplum Page Component
 */
const InvoicesMedplumPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Use the new hooks for invoice management
  const { 
    data: invoices = [], 
    isLoading: loading, 
    error,
    isError 
  } = useInvoices({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Invoices are already filtered by the hook, so we can use them directly
  const filteredInvoices = invoices;

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openDetails();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openEdit();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR invoices...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Invoices</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage billing and invoices</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Invoice
          </Button>
        </Group>

        {/* Error Alert */}
        {isError && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error?.message || 'Failed to fetch invoices. Using mock data as fallback.'}
          </Alert>
        )}

        {/* Search and Filters */}
        <Group>
          <TextInput
            placeholder="Search invoices..."
            leftSection={<Search size={16} />}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            leftSection={<Filter size={16} />}
            data={[
              { value: 'all', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'issued', label: 'Issued' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'entered-in-error', label: 'Error' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            w={200}
          />
        </Group>

        {/* Invoices Grid */}
        {filteredInvoices.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Receipt size={48} color="gray" />
              <Text size="lg" fw={500} c="dimmed">
                {isError ? 'No invoices available' : 'No invoices found'}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {isError ? 'Check your FHIR server connection' : 'Try adjusting your filters or create new invoices'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredInvoices.map((invoice) => (
              <Grid.Col key={invoice.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRInvoiceCard
                  invoice={invoice}
                  onView={handleViewInvoice}
                  onEdit={handleEditInvoice}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Invoice Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Invoice #${selectedInvoice?.id}`}
          size="lg"
        >
          {selectedInvoice && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Invoice ID: {selectedInvoice.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Patient</Text>
                    <Text size="sm" c="dimmed">
                      {selectedInvoice.subject?.display || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedInvoice.status === 'balanced' ? 'green' : 'blue'}>
                      {selectedInvoice.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Total Amount</Text>
                    <Text size="sm" c="dimmed">
                      {selectedInvoice.totalNet?.value ? `$${selectedInvoice.totalNet.value.toFixed(2)}` : 'N/A'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Date</Text>
                    <Text size="sm" c="dimmed">
                      {selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Create and Edit Modals */}
        <CreateInvoiceModal
          opened={createOpened}
          onClose={closeCreate}
        />

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Invoice"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR invoice editing requires specific implementation for the selected Invoice resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default InvoicesMedplumPage;