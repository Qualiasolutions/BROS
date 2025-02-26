import { createReservation, validateReservationCredentials } from '../../utils/reservationSystem';
import { findDocuments, insertDocument, updateDocument, findDocument } from '../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, data, credentials } = req.body;
      
      if (action === 'create') {
        try {
          const result = await createReservation(data, credentials);
          return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
          console.error('Error creating reservation:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error creating reservation',
            error: error.message
          });
        }
      } 
      
      if (action === 'validate') {
        try {
          const isValid = await validateReservationCredentials(credentials);
          return res.status(200).json({ success: isValid });
        } catch (error) {
          console.error('Error validating credentials:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error validating credentials',
            error: error.message
          });
        }
      }
      
      if (action === 'list') {
        // List reservations for a specific date
        const { date } = data;
        try {
          const reservations = await findDocuments('reservations', {
            date: { $regex: `^${date}` }
          });
          return res.status(200).json({ success: true, reservations });
        } catch (error) {
          console.error('Error listing reservations:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error listing reservations',
            error: error.message
          });
        }
      }
      
      if (action === 'update') {
        // Update a reservation
        const { id, updates } = data;
        try {
          const result = await updateDocument('reservations', { id }, updates);
          return res.status(200).json({ success: result.acknowledged });
        } catch (error) {
          console.error('Error updating reservation:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error updating reservation',
            error: error.message
          });
        }
      }
      
      if (action === 'save') {
        // Save a reservation without automation
        try {
          const result = await insertDocument('reservations', data);
          return res.status(200).json({ 
            success: true, 
            message: 'Reservation saved successfully',
            id: result.insertedId
          });
        } catch (error) {
          console.error('Error saving reservation:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error saving reservation',
            error: error.message
          });
        }
      }
      
      return res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (error) {
      console.error('General API error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error processing request',
        error: error.message
      });
    }
  } else if (req.method === 'GET') {
    // Handle GET requests to fetch reservations
    try {
      const { date, id } = req.query;
      
      if (id) {
        // Get a specific reservation by ID
        try {
          const reservation = await findDocument('reservations', { id });
          if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
          }
          return res.status(200).json({ success: true, reservation });
        } catch (error) {
          console.error('Error finding reservation by ID:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error finding reservation',
            error: error.message
          });
        }
      }
      
      if (date) {
        // Get reservations for a specific date
        try {
          const reservations = await findDocuments('reservations', {
            date: { $regex: `^${date}` }
          });
          return res.status(200).json({ success: true, reservations });
        } catch (error) {
          console.error('Error finding reservations by date:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error finding reservations by date',
            error: error.message
          });
        }
      }
      
      // Get all reservations (with pagination)
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const reservations = await findDocuments('reservations', {}, {
          sort: { createdAt: -1 },
          limit,
          skip
        });
        
        return res.status(200).json({ success: true, reservations });
      } catch (error) {
        console.error('Error listing all reservations:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Server error listing all reservations',
          error: error.message
        });
      }
    } catch (error) {
      console.error('General GET API error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error processing GET request',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 