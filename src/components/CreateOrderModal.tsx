/**
 * CreateOrderModal Component
 * Modal for creating new FHIR orders (ServiceRequest or MedicationRequest)
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Alert,
  Text,
  Divider,
  Card,
  Loader,
} from '@mantine/core';
import { AlertCircle, FileText, Pill, User, Search } from 'lucide-react';
import { showNotification } from '@mantine/notifications';
import { useCreateOrder, usePatients, useProducts } from '../hooks/useQuery';

interface CreateOrderModalProps {
  opened: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

/**
 * Modal component for creating new medical orders
 * @param opened - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param onOrderCreated - Optional callback when order is created
 */
const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  opened,
  onClose,
  onOrderCreated,
}) => {
  const [orderType, setOrderType] = useState<'ServiceRequest' | 'MedicationRequest'>('ServiceRequest');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'asap' | 'stat'>('routine');
  const [category, setCategory] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = useCreateOrder();
  
  // Fetch patients for searchable dropdown
  const { data: patients = [], isLoading: patientsLoading } = usePatients({
    search: patientSearchQuery,
    status: 'active'
  });
  
  // Fetch products for medication orders
  const { data: products = [], isLoading: productsLoading } = useProducts({
    search: productSearchQuery,
    status: 'active'
  });
  
  // Prepare patient options for Select component
  const patientOptions = useMemo(() => {
    if (!patients || !Array.isArray(patients)) return [];
    return patients
      .filter(patient => patient && patient.id) // Filter out undefined patients or patients without id
      .map(patient => ({
        value: patient.id,
        label: `${patient.name || 'Unknown'} (DOB: ${patient.dateOfBirth || 'N/A'})`,
        searchValue: `${patient.name || ''} ${patient.dateOfBirth || ''} ${patient.email || ''} ${patient.phone || ''}`.toLowerCase()
      }));
  }, [patients]);
  
  // Prepare product options for Select component
  const productOptions = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products
      .filter(product => product && product.id) // Filter out undefined products or products without id
      .map(product => ({
        value: product.id,
        label: `${product.name || 'Unknown'} - ${product.description || ''}`,
        searchValue: `${product.name || ''} ${product.description || ''} ${product.manufacturer || ''}`.toLowerCase()
      }));
  }, [products]);
  
  // Get selected patient name for form submission
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);
  const selectedProduct = products?.find(p => p.id === selectedProductId);

  /**
   * Handles form submission to create a new order
   */
  const handleSubmit = async () => {
    // Validation
    if (!selectedPatientId) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select a patient',
        color: 'red',
      });
      return;
    }

    if (orderType === 'MedicationRequest' && !selectedProductId) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select a medication',
        color: 'red',
      });
      return;
    }

    if (orderType === 'ServiceRequest' && !description.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please provide a service description',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        orderType,
        patientId: selectedPatientId,
        patientName: selectedPatient?.name || '',
        description: orderType === 'MedicationRequest' 
          ? selectedProduct?.name || '' 
          : description.trim(),
        priority,
        category: category || undefined,
        requesterName: requesterName.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await createOrderMutation.mutateAsync(orderData);

      showNotification({
        title: 'Success',
        message: `${orderType === 'ServiceRequest' ? 'Service request' : 'Medication request'} created successfully`,
        color: 'green',
      });

      // Reset form
      setSelectedPatientId('');
      setSelectedProductId('');
      setPatientSearchQuery('');
      setProductSearchQuery('');
      setDescription('');
      setPriority('routine');
      setCategory('');
      setRequesterName('');
      setNotes('');
      
      onOrderCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification({
        title: 'Error',
        message: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles modal close and resets form
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedPatientId('');
      setSelectedProductId('');
      setPatientSearchQuery('');
      setProductSearchQuery('');
      setDescription('');
      setPriority('routine');
      setCategory('');
      setRequesterName('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Order"
      size="lg"
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Stack gap="md">
        {/* Order Type Selection */}
        <Card withBorder padding="sm">
          <Stack gap="xs">
            <Text size="sm" fw={500}>Order Type</Text>
            <Select
              value={orderType}
              onChange={(value) => setOrderType(value as 'ServiceRequest' | 'MedicationRequest')}
              data={[
                { 
                  value: 'ServiceRequest', 
                  label: 'Service Request (Lab tests, Imaging, Procedures)' 
                },
                { 
                  value: 'MedicationRequest', 
                  label: 'Medication Request (Prescriptions)' 
                },
              ]}
              leftSection={orderType === 'ServiceRequest' ? <FileText size={16} /> : <Pill size={16} />}
              disabled={isSubmitting}
            />
          </Stack>
        </Card>

        <Divider />

        {/* Patient Selection */}
        <Select
          label="Patient"
          placeholder="Search and select a patient"
          value={selectedPatientId}
          onChange={(value) => setSelectedPatientId(value || '')}
          data={patientOptions}
          searchable
          searchValue={patientSearchQuery}
          onSearchChange={setPatientSearchQuery}
          nothingFoundMessage={patientsLoading ? <Loader size="sm" /> : "No patients found"}
          leftSection={<User size={16} />}
          rightSection={patientsLoading ? <Loader size="sm" /> : <Search size={16} />}
          required
          disabled={isSubmitting}
          clearable
          maxDropdownHeight={200}
        />

        {/* Order Details */}
        {orderType === 'MedicationRequest' ? (
          <Select
            label="Medication"
            placeholder="Search and select a medication"
            value={selectedProductId}
            onChange={(value) => setSelectedProductId(value || '')}
            data={productOptions}
            searchable
            searchValue={productSearchQuery}
            onSearchChange={setProductSearchQuery}
            nothingFoundMessage={productsLoading ? <Loader size="sm" /> : "No medications found"}
            leftSection={<Pill size={16} />}
            rightSection={productsLoading ? <Loader size="sm" /> : <Search size={16} />}
            required
            disabled={isSubmitting}
            clearable
            maxDropdownHeight={200}
          />
        ) : (
          <TextInput
            label="Service/Test Description"
            placeholder="e.g., Complete Blood Count, Chest X-Ray, MRI Brain"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            required
            disabled={isSubmitting}
            leftSection={<FileText size={16} />}
          />
        )}

        {/* Priority */}
        <Select
          label="Priority"
          value={priority}
          onChange={(value) => setPriority(value as 'routine' | 'urgent' | 'asap' | 'stat')}
          data={[
            { value: 'routine', label: 'Routine' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'asap', label: 'ASAP' },
            { value: 'stat', label: 'STAT' },
          ]}
          disabled={isSubmitting}
        />

        {/* Category (for ServiceRequest only) */}
        {orderType === 'ServiceRequest' && (
          <Select
            label="Category (Optional)"
            placeholder="Select category"
            value={category}
            onChange={(value) => setCategory(value || '')}
            data={[
              { value: 'laboratory', label: 'Laboratory' },
              { value: 'imaging', label: 'Imaging' },
              { value: 'procedure', label: 'Procedure' },
              { value: 'consultation', label: 'Consultation' },
            ]}
            clearable
            disabled={isSubmitting}
          />
        )}

        {/* Requester */}
        <TextInput
          label="Requesting Provider (Optional)"
          placeholder="Enter provider name"
          value={requesterName}
          onChange={(e) => setRequesterName(e.currentTarget.value)}
          disabled={isSubmitting}
        />

        {/* Notes */}
        <Textarea
          label="Notes (Optional)"
          placeholder="Additional notes or instructions"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          minRows={3}
          disabled={isSubmitting}
        />

        {/* FHIR Information */}
        <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
          This will create a FHIR {orderType} resource in the Medplum database.
        </Alert>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={
              !selectedPatientId || 
              (orderType === 'MedicationRequest' && !selectedProductId) ||
              (orderType === 'ServiceRequest' && !description.trim())
            }
          >
            Create Order
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CreateOrderModal;