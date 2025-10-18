import React, { useState, useMemo } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  Text,
  Divider,
  ActionIcon,
  Table,
  Paper,
  Badge,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';
import { useCreateInvoice, usePatients } from '../hooks/useQuery';

/**
 * Props for the CreateInvoiceModal component
 */
export interface CreateInvoiceModalProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Function to close the modal */
  onClose: () => void;
}

/**
 * Interface for invoice line items
 */
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Modal component for creating new invoices with patient selection, line items, and FHIR integration
 * 
 * Features:
 * - Patient selection with searchable dropdown
 * - Invoice details (description, amount, due date)
 * - Dynamic line items with quantity and pricing
 * - Automatic tax calculation (10%)
 * - Form validation and error handling
 * - Integration with Medplum FHIR server
 * - Mock data fallback for offline functionality
 * 
 * @param props - Component props
 * @returns CreateInvoiceModal component
 */
export function CreateInvoiceModal({ opened, onClose }: CreateInvoiceModalProps) {
  // Form state
  const [patientId, setPatientId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [useLineItems, setUseLineItems] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Hooks
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const createInvoiceMutation = useCreateInvoice();

  // Prepare patient options for Select component
  const patientOptions = useMemo(() => {
    return patients
      .filter(patient => patient && patient.id)
      .map(patient => ({
        value: patient.id,
        label: `${patient.name} (ID: ${patient.id})`,
      }));
  }, [patients]);

  // Find selected patient
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === patientId);
  }, [patients, patientId]);

  // Calculate totals
  const subtotal = useMemo(() => {
    if (useLineItems) {
      return lineItems.reduce((sum, item) => sum + item.total, 0);
    }
    return amount;
  }, [useLineItems, lineItems, amount]);

  const taxAmount = useMemo(() => {
    return subtotal * 0.1; // 10% tax
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  /**
   * Add a new line item to the invoice
   */
  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  /**
   * Remove a line item from the invoice
   * @param itemId - ID of the item to remove
   */
  const removeLineItem = (itemId: string) => {
    setLineItems(lineItems.filter(item => item.id !== itemId));
  };

  /**
   * Update a line item's properties
   * @param itemId - ID of the item to update
   * @param field - Field to update
   * @param value - New value
   */
  const updateLineItem = (itemId: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setPatientId('');
    setDescription('');
    setAmount(0);
    setCurrency('USD');
    setDueDate(null);
    setNotes('');
    setUseLineItems(false);
    setLineItems([]);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // Validation
    if (!patientId) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a patient',
        color: 'red',
      });
      return;
    }

    if (!description.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please enter an invoice description',
        color: 'red',
      });
      return;
    }

    if (useLineItems) {
      if (lineItems.length === 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please add at least one line item',
          color: 'red',
        });
        return;
      }

      // Validate line items
      const invalidItems = lineItems.filter(item => 
        !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0
      );

      if (invalidItems.length > 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please fill in all line item details with valid values',
          color: 'red',
        });
        return;
      }
    } else {
      if (amount <= 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please enter a valid amount greater than 0',
          color: 'red',
        });
        return;
      }
    }

    try {
      // Prepare invoice data
      const invoiceData = {
        patientId,
        patientName: selectedPatient?.name,
        description,
        amount: useLineItems ? subtotal : amount,
        currency,
        dueDate: dueDate?.toISOString().split('T')[0],
        lineItems: useLineItems ? lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })) : undefined,
        notes: notes.trim() || undefined,
      };

      await createInvoiceMutation.mutateAsync(invoiceData);

      notifications.show({
        title: 'Success',
        message: 'Invoice created successfully',
        color: 'green',
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create invoice. Please try again.',
        color: 'red',
      });
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Invoice"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Patient Selection */}
        <Select
          label="Patient"
          placeholder="Select a patient"
          data={patientOptions}
          value={patientId}
          onChange={(value) => setPatientId(value || '')}
          searchable
          clearable
          loading={patientsLoading}
          required
          error={!patientId ? 'Patient selection is required' : null}
        />

        {/* Selected Patient Info */}
        {selectedPatient && (
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              <strong>Patient:</strong> {selectedPatient.name}<br />
              <strong>Email:</strong> {selectedPatient.email || 'Not provided'}<br />
              <strong>Phone:</strong> {selectedPatient.phone || 'Not provided'}
            </Text>
          </Alert>
        )}

        {/* Invoice Description */}
        <TextInput
          label="Invoice Description"
          placeholder="Enter invoice description"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          required
          error={!description.trim() ? 'Description is required' : null}
        />

        {/* Currency Selection */}
        <Select
          label="Currency"
          data={[
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'EUR', label: 'EUR - Euro' },
            { value: 'GBP', label: 'GBP - British Pound' },
            { value: 'CAD', label: 'CAD - Canadian Dollar' },
          ]}
          value={currency}
          onChange={(value) => setCurrency(value || 'USD')}
        />

        {/* Due Date */}
        <DateInput
          label="Due Date (Optional)"
          placeholder="Select due date"
          value={dueDate}
          onChange={setDueDate}
          minDate={new Date()}
        />

        {/* Line Items Toggle */}
        <Group>
          <Button
            variant={useLineItems ? 'filled' : 'outline'}
            onClick={() => {
              setUseLineItems(!useLineItems);
              if (!useLineItems) {
                setAmount(0);
              } else {
                setLineItems([]);
              }
            }}
          >
            {useLineItems ? 'Use Simple Amount' : 'Use Line Items'}
          </Button>
        </Group>

        {/* Simple Amount Input */}
        {!useLineItems && (
          <NumberInput
            label="Amount"
            placeholder="Enter invoice amount"
            value={amount}
            onChange={(value) => setAmount(Number(value) || 0)}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
            required
            error={amount <= 0 ? 'Amount must be greater than 0' : null}
          />
        )}

        {/* Line Items Section */}
        {useLineItems && (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>Line Items</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={addLineItem}
                size="sm"
                variant="light"
              >
                Add Item
              </Button>
            </Group>

            {lineItems.length > 0 && (
              <Paper withBorder p="sm">
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Qty</Table.Th>
                      <Table.Th>Unit Price</Table.Th>
                      <Table.Th>Total</Table.Th>
                      <Table.Th width={50}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {lineItems.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>
                          <TextInput
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.currentTarget.value)}
                            size="sm"
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            value={item.quantity}
                            onChange={(value) => updateLineItem(item.id, 'quantity', Number(value) || 1)}
                            min={1}
                            size="sm"
                            w={80}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            value={item.unitPrice}
                            onChange={(value) => updateLineItem(item.id, 'unitPrice', Number(value) || 0)}
                            min={0}
                            decimalScale={2}
                            fixedDecimalScale
                            size="sm"
                            w={100}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                            {item.total.toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => removeLineItem(item.id)}
                            size="sm"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}

            {lineItems.length === 0 && (
              <Text c="dimmed" ta="center" py="md">
                No line items added. Click "Add Item" to get started.
              </Text>
            )}
          </Stack>
        )}

        {/* Invoice Summary */}
        {(amount > 0 || subtotal > 0) && (
          <Paper withBorder p="md" bg="gray.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text>Subtotal:</Text>
                <Text fw={500}>
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                  {subtotal.toFixed(2)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text>Tax (10%):</Text>
                <Text fw={500}>
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                  {taxAmount.toFixed(2)}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text fw={700} size="lg">Total:</Text>
                <Text fw={700} size="lg" c="blue">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                  {totalAmount.toFixed(2)}
                </Text>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Notes */}
        <Textarea
          label="Notes (Optional)"
          placeholder="Additional notes or comments"
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          minRows={3}
        />

        {/* FHIR Information */}
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          <Text size="sm">
            This invoice will be created as a FHIR Invoice resource in the Medplum server.
            If the server is unavailable, it will be stored locally as mock data.
          </Text>
        </Alert>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createInvoiceMutation.isPending}
            disabled={
              !patientId || 
              !description.trim() || 
              (useLineItems ? lineItems.length === 0 : amount <= 0)
            }
          >
            Create Invoice
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default CreateInvoiceModal;