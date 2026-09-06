import { CodeFile } from '../../types';
import { paymentPageAspx, paymentPageCs } from './paymentPageCode';
import { rentEditAspx, rentEditCs, waterEditAspx, waterEditCs } from './editPagesCode';
import { adminMainAspx, adminMainCs, customerMainAspx, customerMainCs } from './authAndMainCode';
import { adminLoginAspx, adminLoginCs, customerLoginAspx, customerLoginCs, infoPageAspx, infoPageCs } from './otherPagesCode';
import { sendPaymentAspx, sendPaymentCs } from './sendPaymentCode';
import { databaseSqlScript, webConfigXml } from './sqlAndConfigCode';

export const ALL_ASPNET_FILES: CodeFile[] = [
  {
    name: 'paymentpage.aspx',
    path: 'paymentpage.aspx',
    type: 'aspx',
    description: 'Combined Payment Page (Water on Left, Rent on Right, Centered PAID/NOT PAID status, Grand Total ₹ 0.00)',
    content: paymentPageAspx,
  },
  {
    name: 'paymentpage.aspx.cs',
    path: 'paymentpage.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Payment Page (Safe table whitelist, dynamic sum, case-insensitive PAID detection)',
    content: paymentPageCs,
  },
  {
    name: 'rentedit.aspx',
    path: 'rentedit.aspx',
    type: 'aspx',
    description: 'Admin Rent Management Page (Insert, Edit, Delete, GridView with [PAID] column & droplist)',
    content: rentEditAspx,
  },
  {
    name: 'rentedit.aspx.cs',
    path: 'rentedit.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Rent Edit with Parameterized SQL queries and GridView events',
    content: rentEditCs,
  },
  {
    name: 'wateredit.aspx',
    path: 'wateredit.aspx',
    type: 'aspx',
    description: 'Admin Water Bill Management Page (Insert, Edit, Delete, GridView with [DAY] & [PAID])',
    content: waterEditAspx,
  },
  {
    name: 'wateredit.aspx.cs',
    path: 'wateredit.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Water Edit with Parameterized SQL and [DAY] / [PAID] support',
    content: waterEditCs,
  },
  {
    name: 'sendpayment.aspx',
    path: 'sendpayment.aspx',
    type: 'aspx',
    description: 'Admin Billing Dispatcher (SMS, Email, and URL-encoded UPI deep link generator)',
    content: sendPaymentAspx,
  },
  {
    name: 'sendpayment.aspx.cs',
    path: 'sendpayment.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for SMS, Email SMTP dispatch, and UPI dynamic link generation',
    content: sendPaymentCs,
  },
  {
    name: 'customermainpage.aspx',
    path: 'customermainpage.aspx',
    type: 'aspx',
    description: 'Customer Main Page with Top-Right Info/Logout, Center Rent/Payment/Water buttons',
    content: customerMainAspx,
  },
  {
    name: 'customermainpage.aspx.cs',
    path: 'customermainpage.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Customer Main Page with btnPayment navigation to paymentpage.aspx',
    content: customerMainCs,
  },
  {
    name: 'adminmainpage.aspx',
    path: 'adminmainpage.aspx',
    type: 'aspx',
    description: 'Admin Main Page (2 Columns: Rent/Water left, Info/Password right; Logout button)',
    content: adminMainAspx,
  },
  {
    name: 'adminmainpage.aspx.cs',
    path: 'adminmainpage.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Admin Main Page Navigation',
    content: adminMainCs,
  },
  {
    name: 'customerloginpage.aspx',
    path: 'customerloginpage.aspx',
    type: 'aspx',
    description: 'Tenant/Customer Login Page (Enter Tenant Number 11, 12, 21, 22, 31, 32, 41)',
    content: customerLoginAspx,
  },
  {
    name: 'customerloginpage.aspx.cs',
    path: 'customerloginpage.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Tenant Authentication and Session["UserName"] assignment',
    content: customerLoginCs,
  },
  {
    name: 'adminloginpage.aspx',
    path: 'adminloginpage.aspx',
    type: 'aspx',
    description: 'Admin Login Page',
    content: adminLoginAspx,
  },
  {
    name: 'adminloginpage.aspx.cs',
    path: 'adminloginpage.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Admin Authentication and Session["AdminName"] assignment',
    content: adminLoginCs,
  },
  {
    name: 'infopage.aspx',
    path: 'infopage.aspx',
    type: 'aspx',
    description: 'Property Information and Emergency Contacts Page',
    content: infoPageAspx,
  },
  {
    name: 'infopage.aspx.cs',
    path: 'infopage.aspx.cs',
    type: 'csharp',
    description: 'C# Code-Behind for Info Page with dynamic return routing',
    content: infoPageCs,
  },
  {
    name: 'Web.config',
    path: 'Web.config',
    type: 'config',
    description: 'Web.config configuration file with R_WAPP connection string, SMTP & UPI settings',
    content: webConfigXml,
  },
  {
    name: 'TenantHub_Database.sql',
    path: 'Database/TenantHub_Database.sql',
    type: 'sql',
    description: 'SQL Server Schema Script: Creates RENT_11..41, Water_11..41, indexes & seed data',
    content: databaseSqlScript,
  },
];
