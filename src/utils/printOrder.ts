import { Order } from "@/services/orderService";

/**
 * Print utility for kitchen orders
 * Generates a print-friendly format for order receipts
 */

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Generate printable HTML for a single order
 */
export const generateOrderPrintHTML = (order: Order): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order #${order.orderNumber}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 80mm;
          margin: 0 auto;
          padding: 10px;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        
        .header .subtitle {
          font-size: 10px;
          margin-top: 5px;
        }
        
        .order-info {
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .order-number {
          font-size: 24px;
          text-align: center;
          margin: 10px 0;
          font-weight: bold;
        }
        
        .customer-info {
          background: #f5f5f5;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
        }
        
        .customer-info div {
          margin: 3px 0;
        }
        
        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 10px 0;
        }
        
        .item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .item-qty {
          font-weight: bold;
          margin-right: 5px;
        }
        
        .item-name {
          flex: 1;
        }
        
        .notes {
          background: #fff3cd;
          border: 2px solid #ffc107;
          padding: 8px;
          margin: 10px 0;
          font-weight: bold;
        }
        
        .notes-title {
          text-decoration: underline;
          margin-bottom: 5px;
        }
        
        .total {
          font-size: 16px;
          font-weight: bold;
          text-align: right;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #000;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #000;
          font-size: 10px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #000;
          color: #fff;
          border-radius: 3px;
          font-size: 10px;
          margin-left: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🍴 FORTALEZA</h1>
        <div class="subtitle">Kitchen Order Receipt</div>
      </div>
      
      <div class="order-number">
        ORDER #${order.orderNumber}
        <span class="status-badge">${order.status.toUpperCase()}</span>
      </div>
      
      <div class="order-info">
        Date: ${formatDate(order.createdAt)}
      </div>
      
      ${order.customerInfo?.table || order.customerInfo?.name
            ? `
      <div class="customer-info">
        ${order.customerInfo.table ? `<div>📍 Table: <strong>${order.customerInfo.table}</strong></div>` : ""}
        ${order.customerInfo.name ? `<div>👤 Customer: <strong>${order.customerInfo.name}</strong></div>` : ""}
        ${order.customerInfo.phone ? `<div>📞 Phone: ${order.customerInfo.phone}</div>` : ""}
      </div>
      `
            : ""
        }
      
      <div class="items">
        <div style="font-weight: bold; margin-bottom: 8px;">ITEMS:</div>
        ${order.items
            .map(
                (item) => `
          <div class="item">
            <div>
              <span class="item-qty">${item.quantity}x</span>
              <span class="item-name">${item.name}</span>
            </div>
          </div>
        `
            )
            .join("")}
      </div>
      
      ${order.customerInfo?.notes
            ? `
      <div class="notes">
        <div class="notes-title">⚠️ SPECIAL INSTRUCTIONS:</div>
        <div>${order.customerInfo.notes}</div>
      </div>
      `
            : ""
        }
      
      <div class="total">
        TOTAL: ${formatPrice(order.totalPrice)}
      </div>
      
      <div class="footer">
        Printed: ${new Date().toLocaleString("pt-PT")}
      </div>
    </body>
    </html>
  `;
};

/**
 * Print a single order
 */
export const printOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Please allow popups to print orders");
        return;
    }

    const html = generateOrderPrintHTML(order);
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Close after printing (optional)
        printWindow.onafterprint = () => {
            printWindow.close();
        };
    };
};

/**
 * Print multiple orders
 */
export const printMultipleOrders = (orders: Order[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Please allow popups to print orders");
        return;
    }

    const htmlContent = orders.map((order) => generateOrderPrintHTML(order)).join('<div style="page-break-after: always;"></div>');

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
            printWindow.close();
        };
    };
};
