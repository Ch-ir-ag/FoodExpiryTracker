import { useState } from 'react';
import { ShelfLifeService } from '@/services/shelfLifeService';
import { SupabaseService } from '@/services/supabaseService';
import toast from 'react-hot-toast';

interface ExpiryDateEditorProps {
  itemId: string;
  itemName: string;
  currentExpiryDate: string;
  onUpdate: () => void;
}

export default function ExpiryDateEditor({
  itemId,
  itemName,
  currentExpiryDate,
  onUpdate
}: ExpiryDateEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState(currentExpiryDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewExpiryDate(currentExpiryDate);
  };

  const handleSubmit = async () => {
    if (newExpiryDate === currentExpiryDate) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);

      // Update the item in the database
      await SupabaseService.updateItemExpiryDate(itemId, newExpiryDate, true);
      
      // Train the model with this correction
      await ShelfLifeService.updateExpiryDate(
        itemName,
        currentExpiryDate,
        newExpiryDate
      );

      toast.success('Expiry date updated successfully');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating expiry date:', error);
      toast.error('Failed to update expiry date');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center">
        <span className="mr-2">{currentExpiryDate}</span>
        <button
          onClick={handleEdit}
          className="text-blue-500 hover:text-blue-700 text-xs"
          aria-label="Edit expiry date"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <input
        type="date"
        value={newExpiryDate}
        onChange={(e) => setNewExpiryDate(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        disabled={isSubmitting}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`text-xs px-2 py-1 rounded ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 