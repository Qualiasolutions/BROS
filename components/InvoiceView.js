import React from 'react';
import styles from '../styles/Home.module.css';
import { formatPrice } from '../utils/data';

const InvoiceView = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.invoiceOverlay}>
      <div className={styles.invoiceContainer}>
        <div className={styles.invoiceHeader}>
          <h2>Invoice</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.invoiceContent}>
          <div className={styles.invoiceTop}>
            <div className={styles.invoiceCompany}>
              <h3>{invoice.issuer.name}</h3>
              <p>{invoice.issuer.address}</p>
              <p>VAT: {invoice.issuer.vat}</p>
              <p>Phone: {invoice.issuer.phone}</p>
            </div>
            
            <div className={styles.invoiceDetails}>
              <div className={styles.invoiceNumber}>
                <h4>Invoice #</h4>
                <p>{invoice.invoiceNumber}</p>
              </div>
              <div className={styles.invoiceDate}>
                <h4>Date</h4>
                <p>{formatDate(invoice.date)}</p>
              </div>
            </div>
          </div>
          
          <div className={styles.invoiceClient}>
            <h4>Bill To:</h4>
            <p>{invoice.customer.name}</p>
            {invoice.customer.address && <p>{invoice.customer.address}</p>}
            {invoice.customer.vat && <p>VAT: {invoice.customer.vat}</p>}
            {invoice.customer.phone && <p>Phone: {invoice.customer.phone}</p>}
          </div>
          
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.unitPrice)}</td>
                  <td>{formatPrice(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className={styles.invoiceSummary}>
            <div className={styles.invoiceSummaryItem}>
              <span>Subtotal:</span>
              <span>{formatPrice(invoice.subtotal)}</span>
            </div>
            <div className={styles.invoiceSummaryItem}>
              <span>VAT (20%):</span>
              <span>{formatPrice(invoice.vat)}</span>
            </div>
            <div className={`${styles.invoiceSummaryItem} ${styles.invoiceTotal}`}>
              <span>Total:</span>
              <span>{formatPrice(invoice.total)}</span>
            </div>
          </div>
          
          {invoice.notes && (
            <div className={styles.invoiceNotes}>
              <h4>Notes:</h4>
              <p>{invoice.notes}</p>
            </div>
          )}
          
          <div className={styles.invoiceFooter}>
            <p>Payment Terms: {invoice.paymentTerms}</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
        
        <div className={styles.invoiceActions}>
          <button className={styles.invoiceButton}>Download PDF</button>
          <button className={styles.invoiceButton}>Send to Client</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView; 