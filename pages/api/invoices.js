import { createUnionInvoice, validateUnionCredentials } from '../../utils/unionAutomation';
import { findDocuments, insertDocument, updateDocument, findDocument } from '../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, data, credentials } = req.body;
      
      if (action === 'create') {
        try {
          const result = await createUnionInvoice(data, credentials);
          return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
          console.error('Error creating invoice:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error creating invoice',
            error: error.message
          });
        }
      } 
      
      if (action === 'validate') {
        try {
          const isValid = await validateUnionCredentials(credentials);
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
      
      if (action === 'save') {
        // Save an invoice without automation
        try {
          const result = await insertDocument('invoices', data);
          return res.status(200).json({ 
            success: true, 
            message: 'Invoice saved successfully',
            id: result.insertedId
          });
        } catch (error) {
          console.error('Error saving invoice:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error saving invoice',
            error: error.message
          });
        }
      }
      
      if (action === 'list') {
        // List invoices for a specific date or client
        try {
          const query = {};
          
          if (data.date) {
            query.date = { $regex: `^${data.date}` };
          }
          
          if (data.client) {
            query['customer.name'] = data.client;
          }
          
          const invoices = await findDocuments('invoices', query);
          return res.status(200).json({ success: true, invoices });
        } catch (error) {
          console.error('Error listing invoices:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error listing invoices',
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
    // Handle GET requests to fetch invoices
    try {
      const { date, id, client } = req.query;
      
      if (id) {
        // Get a specific invoice by ID
        try {
          const invoice = await findDocument('invoices', { id });
          if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
          }
          return res.status(200).json({ success: true, invoice });
        } catch (error) {
          console.error('Error finding invoice by ID:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Server error finding invoice',
            error: error.message
          });
        }
      }
      
      // Build query based on parameters
      const query = {};
      
      if (date) {
        query.date = { $regex: `^${date}` };
      }
      
      if (client) {
        query['customer.name'] = client;
      }
      
      // Get invoices with pagination
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const invoices = await findDocuments('invoices', query, {
          sort: { createdAt: -1 },
          limit,
          skip
        });
        
        return res.status(200).json({ success: true, invoices });
      } catch (error) {
        console.error('Error listing invoices:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Server error listing invoices',
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