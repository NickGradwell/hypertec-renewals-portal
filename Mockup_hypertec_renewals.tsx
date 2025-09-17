import React, { useState, useEffect, useMemo } from "react";
// NOTE: Firebase imports are commented out as we are still in mockup phase without real backend
// import { auth, db } from './firebaseConfig';
// import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

// --- Constants ---
const ROLE_ADMIN = "Hypertec Admin"; // Document Role: Admin
const ROLE_PARTNER = "Partner"; // Document Role: Maps roughly to Restricted Viewer (for their data) / Standard User (for adding)
const ROLE_CUSTOMER = "Customer"; // Document Role: Maps roughly to Viewer (for their data)
// Document Roles not explicitly simulated: Standard User (non-delete/config), Viewer (read-only general)
const USER_ROLES = [ROLE_ADMIN, ROLE_PARTNER, ROLE_CUSTOMER];

const TYPE_PARTNER = "Partner";
const TYPE_CUSTOMER = "Customer";
const COMPANY_TYPES = [TYPE_PARTNER, TYPE_CUSTOMER];

const RECORD_TYPE_SOFTWARE = "Software License";
const RECORD_TYPE_VOUCHER = "Service Voucher";

// --- Mock Data ---

// Mock Companies (Added Reseller Email)
const initialMockCompanies = [
  {
    id: "comp-hypertec",
    name: "Hypertec (Internal)",
    type: "Admin",
    resellerEmail: null,
  },
  {
    id: "comp-px",
    name: "Partner X",
    type: TYPE_PARTNER,
    resellerEmail: "contact@partnerx.example",
  },
  {
    id: "comp-py",
    name: "Partner Y",
    type: TYPE_PARTNER,
    resellerEmail: "sales@partnery.example",
  },
  {
    id: "comp-alpha",
    name: "Alpha Corp",
    type: TYPE_CUSTOMER,
    resellerEmail: null,
  },
  {
    id: "comp-beta",
    name: "Beta Solutions",
    type: TYPE_CUSTOMER,
    resellerEmail: null,
  },
  {
    id: "comp-gamma",
    name: "Gamma Industries",
    type: TYPE_CUSTOMER,
    resellerEmail: null,
  },
  {
    id: "comp-delta",
    name: "Delta Systems",
    type: TYPE_CUSTOMER,
    resellerEmail: null,
  },
  {
    id: "comp-epsilon",
    name: "Epsilon Ltd",
    type: TYPE_CUSTOMER,
    resellerEmail: null,
  },
  {
    id: "comp-zeta",
    name: "Zeta Components",
    type: TYPE_CUSTOMER,
    resellerEmail: null,
  },
];

// Mock Users (No major change needed here for now)
const initialMockUsers = [
  /* ... same as before ... */ {
    id: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@hypertec.example",
    companyId: "comp-hypertec",
    role: ROLE_ADMIN,
    loginTime: new Date(Date.now() - 1000 * 60 * 5).toLocaleString(),
  },
  {
    id: "partnerX",
    firstName: "PartnerX",
    lastName: "Rep",
    email: "user@partnerx.example",
    companyId: "comp-px",
    role: ROLE_PARTNER,
    loginTime: new Date(Date.now() - 1000 * 60 * 60).toLocaleString(),
  },
  {
    id: "partnerY",
    firstName: "PartnerY",
    lastName: "User",
    email: "user@partnery.example",
    companyId: "comp-py",
    role: ROLE_PARTNER,
    loginTime: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(),
  },
  {
    id: "customerAlpha",
    firstName: "Alpha",
    lastName: "Contact",
    email: "user@alpha.example",
    companyId: "comp-alpha",
    role: ROLE_CUSTOMER,
    loginTime: new Date(Date.now() - 1000 * 30).toLocaleString(),
  },
  {
    id: "customerBeta",
    firstName: "Beta",
    lastName: "User",
    email: "user@beta.example",
    companyId: "comp-beta",
    role: ROLE_CUSTOMER,
    loginTime: new Date(Date.now() - 1000 * 60 * 240).toLocaleString(),
  },
];

// Mock Renewals/Vouchers (Updated Structure)
const initialMockRecords = [
  // Software Licenses
  {
    id: "rec1",
    recordType: RECORD_TYPE_SOFTWARE,
    customerName: "Alpha Corp",
    partnerName: "Partner X",
    partcode: "HYP-SFW-1Y",
    serial: "SN12345678",
    renewalDue: "2025-08-15",
    status: "Active",
    licenses: 5,
    dateOfOrder: "2024-08-10",
    dateOfIssue: "2024-08-14",
    helReference: "HEL1001",
    resellerOrderNum: "PO-PX-001",
    endUserRef: "EU-Alpha-01",
    renewalEnabled: true,
    instructions: "Download from portal: portal.hypertec.com/downloads/sfw1",
  },
  {
    id: "rec2",
    recordType: RECORD_TYPE_SOFTWARE,
    customerName: "Beta Solutions",
    partnerName: "Partner Y",
    partcode: "HYP-HDW-3Y",
    serial: "SN87654321",
    renewalDue: "2025-06-30",
    status: "Expiring Soon",
    licenses: 1,
    dateOfOrder: "2022-06-25",
    dateOfIssue: "2022-06-28",
    helReference: "HEL1002",
    resellerOrderNum: "PO-PY-005",
    endUserRef: "EU-Beta-05",
    renewalEnabled: true,
    instructions: "See attached PDF for setup.",
  },
  {
    id: "rec3",
    recordType: RECORD_TYPE_SOFTWARE,
    customerName: "Gamma Industries",
    partnerName: "Partner X",
    partcode: "HYP-CLD-M",
    serial: "SNABCDEFGH",
    renewalDue: "2026-01-10",
    status: "Active",
    licenses: 20,
    dateOfOrder: "2025-01-05",
    dateOfIssue: "2025-01-09",
    helReference: "HEL1003",
    resellerOrderNum: "PO-PX-002",
    endUserRef: "EU-Gamma-10",
    renewalEnabled: false,
    instructions: "Cloud access auto-provisioned.",
  },
  {
    id: "rec4",
    recordType: RECORD_TYPE_SOFTWARE,
    customerName: "Delta Systems",
    partnerName: null,
    partcode: "HYP-SFW-1Y",
    serial: "SNIJKLMNOP",
    renewalDue: "2025-05-01",
    status: "Expired",
    licenses: 2,
    dateOfOrder: "2024-04-20",
    dateOfIssue: "2024-04-25",
    helReference: "HEL1004",
    resellerOrderNum: null,
    endUserRef: "EU-Delta-15",
    renewalEnabled: true,
    instructions: "Download from portal: portal.hypertec.com/downloads/sfw1",
  },
  // Service Vouchers
  {
    id: "rec5",
    recordType: RECORD_TYPE_VOUCHER,
    customerName: "Alpha Corp",
    partnerName: "Partner X",
    partcode: "HYP-SVC-STD",
    serial: null,
    renewalDue: "2025-10-31",
    status: "Active",
    licenses: 10,
    dateOfOrder: "2024-10-15",
    dateOfIssue: "2024-10-20",
    helReference: "HEL2001",
    resellerOrderNum: "PO-PX-003",
    endUserRef: "EU-Alpha-02",
    voucherCodes: [
      "VCA001",
      "VCA002",
      "VCA003",
      "VCA004",
      "VCA005",
      "VCA006",
      "VCA007",
      "VCA008",
      "VCA009",
      "VCA010",
    ],
    claimedCount: 3,
    instructions: "Redeem at redeem.hypertec.com",
  },
  {
    id: "rec6",
    recordType: RECORD_TYPE_VOUCHER,
    customerName: "Epsilon Ltd",
    partnerName: "Partner Y",
    partcode: "HYP-SVC-PREM",
    serial: null,
    renewalDue: "2025-12-31",
    status: "Active",
    licenses: 5,
    dateOfOrder: "2024-12-10",
    dateOfIssue: "2024-12-18",
    helReference: "HEL2002",
    resellerOrderNum: "PO-PY-010",
    endUserRef: "EU-Eps-20",
    voucherCodes: ["VCE001", "VCE002", "VCE003", "VCE004", "VCE005"],
    claimedCount: 0,
    instructions: "Contact support@hypertec.com to redeem.",
  },
];

// Mock Email Logs (Add voucher examples)
const initialMockEmailLogs = [
  /* ... same software logs ... */ {
    id: "log1",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    recipient: "user@beta.example",
    subject: "Reminder: Your Hypertec Renewal for HYP-HDW-3Y",
    status: "Sent",
    templateUsed: "software_60day",
    body: "...",
  },
  {
    id: "log2",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    recipient: "user@alpha.example",
    subject: "Reminder: Your Hypertec Renewal for HYP-SFW-1Y",
    status: "Sent",
    templateUsed: "software_90day",
    body: "...",
  },
  {
    id: "log3",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    recipient: "user@epsilon.example",
    subject: "Reminder: Your Hypertec Renewal for HYP-SVC-PREM",
    status: "Failed",
    templateUsed: "software_90day",
    body: "...",
  },
  {
    id: "log4",
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    recipient: "user@gamma.example",
    subject: "Reminder: Your Hypertec Renewal for HYP-CLD-M",
    status: "Sent",
    templateUsed: "software_90day",
    body: "...",
  },
  // Voucher examples
  {
    id: "log5",
    timestamp: new Date(Date.now() - 86400000 * 35).toISOString(),
    recipient: "user@alpha.example",
    subject: "Reminder: Unused Hypertec Service Vouchers",
    status: "Sent",
    templateUsed: "voucher_monthly",
    body: "Dear Alpha Corp,\n\nYou have 7 unused service vouchers associated with HEL ref HEL2001 (Your ref: EU-Alpha-02) expiring on 2025-10-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team",
  },
  {
    id: "log6",
    timestamp: new Date(Date.now() - 86400000 * 40).toISOString(),
    recipient: "user@epsilon.example",
    subject: "Reminder: Unused Hypertec Service Vouchers",
    status: "Sent",
    templateUsed: "voucher_initial",
    body: "Dear Epsilon Ltd,\n\nYou have 5 unused service vouchers associated with HEL ref HEL2002 (Your ref: EU-Eps-20) expiring on 2025-12-31.\n\nPlease redeem them soon.\n\nThanks,\nThe Hypertec Team",
  },
];

// --- Helper Functions ---
const getCompanyNameById = (companyId, companies) => {
  /* ... */ const company = companies.find((c) => c.id === companyId);
  return company ? company.name : "N/A";
};
const getCompanyById = (companyId, companies) => {
  /* ... */ return companies.find((c) => c.id === companyId);
};
const formatTimestamp = (isoString) => {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// --- UI Components ---
// (Button, Card, Table, Input, Textarea, Switch, Label, Select, KPICard, Placeholders - remain largely the same)
// Button Component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const primaryColor = "#2962FF";
  const primaryHoverColor = "#0039CB";
  const baseStyle =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: `bg-[${primaryColor}] text-white hover:bg-[${primaryHoverColor}]`,
    destructive: "bg-red-600 text-white hover:bg-red-700/90",
    outline: `border border-input hover:bg-[${primaryColor}]/10 hover:text-[${primaryColor}]`,
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300/80",
    ghost: `hover:bg-[${primaryColor}]/10 hover:text-[${primaryColor}]`,
    link: `underline-offset-4 hover:underline text-[${primaryColor}]`,
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
  };
  if (props.as === "span") {
    const { as, type, disabled, ...spanProps } = props;
    return (
      <span
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...spanProps}
      >
        {children}
      </span>
    );
  }
  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
// Card Components
const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-xl border bg-white text-card-foreground shadow ${className}`}
    {...props}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);
const CardTitle = ({ children, className = "", ...props }) => (
  <h3
    className={`font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);
const CardDescription = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);
const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);
const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);
// Table Components
const Table = ({ children, className = "", ...props }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);
const TableHeader = ({ children, className = "", ...props }) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props}>
    {children}
  </thead>
);
const TableBody = ({ children, className = "", ...props }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
    {children}
  </tbody>
);
const TableRow = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
);
const TableHead = ({ children, className = "", ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);
const TableCell = ({ children, className = "", ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
);
// Input Component
const Input = ({ className = "", type, ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);
// Textarea Component
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);
// Switch Component
const Switch = ({ checked, onCheckedChange, id, className = "", ...props }) => {
  const primaryColor = "#2962FF";
  const uncheckedColor = "#9E9E9E";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${primaryColor}] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? `bg-[${primaryColor}]` : `bg-[${uncheckedColor}]`
      } ${className}`}
      id={id}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />{" "}
    </button>
  );
};
// Label Component
const Label = ({ children, htmlFor, className = "", ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
);
// Select Component (Basic Simulation)
const Select = ({ children, value, onChange, className = "", ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className={`h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </select>
);
const SelectItem = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);
// --- Placeholder Chart Components ---
const KPICard = ({ title, value, description, icon, color = "#2962FF" }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon && <span className={`text-[${color}]`}>{icon}</span>}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
const PlaceholderBarChart = ({ title, description }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-[200px] flex items-end justify-around p-4 bg-gray-50 rounded-md">
      <div
        className="w-8 bg-[#2962FF] rounded-t-sm"
        style={{ height: "60%" }}
      ></div>
      <div
        className="w-8 bg-[#2962FF]/70 rounded-t-sm"
        style={{ height: "80%" }}
      ></div>
      <div
        className="w-8 bg-[#2962FF]/50 rounded-t-sm"
        style={{ height: "40%" }}
      ></div>
      <div
        className="w-8 bg-[#2962FF]/30 rounded-t-sm"
        style={{ height: "70%" }}
      ></div>
      <div
        className="w-8 bg-[#2962FF]/20 rounded-t-sm"
        style={{ height: "50%" }}
      ></div>
    </CardContent>
    <CardFooter className="text-xs text-muted-foreground pt-4">
      Mock data shown
    </CardFooter>
  </Card>
);
const PlaceholderPieChart = ({ title, description }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-[200px] flex items-center justify-center p-4 bg-gray-50 rounded-md">
      <div className="w-32 h-32 rounded-full flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute w-full h-full"
          style={{
            background: `conic-gradient(#2962FF 0% 35%, #1E88E5 35% 65%, #64B5F6 65% 90%, #BBDEFB 90% 100%)`,
          }}
        ></div>
        <div className="w-16 h-16 bg-gray-50 rounded-full z-10"></div>
      </div>
    </CardContent>
    <CardFooter className="text-xs text-muted-foreground pt-4">
      Mock data shown
    </CardFooter>
  </Card>
);

// --- Application Components ---

// Sidebar Navigation (Updated Item Names and Added Upload)
const Sidebar = ({ user, activeView, setActiveView }) => {
  // Define all possible nav items with updated names and roles
  const allNavItems = [
    {
      name: "Dashboard",
      icon: "🏠",
      roles: [ROLE_ADMIN, ROLE_PARTNER, ROLE_CUSTOMER],
    },
    { name: "Upload Licenses", icon: "📤", roles: [ROLE_ADMIN, ROLE_PARTNER] },
    { name: "Email Templates", icon: "✉️", roles: [ROLE_ADMIN, ROLE_PARTNER] },
    { name: "Email Logs", icon: "📜", roles: [ROLE_ADMIN, ROLE_PARTNER] },
    { name: "Reports", icon: "📊", roles: [ROLE_ADMIN, ROLE_PARTNER] },
    { name: "User & Company Management", icon: "🏢", roles: [ROLE_ADMIN] },
  ];

  // Filter nav items based on the current user's role
  const visibleNavItems = allNavItems.filter(
    (item) => user && user.role && item.roles.includes(user.role)
  );

  const sidebarBgColor = "#1A237E";
  const activeBgColor = "#2962FF";
  const hoverBgColor = "#283593";
  const textColor = "#FFFFFF";
  const hoverTextColor = "#FFFFFF";
  const inactiveTextColor = "#E0E0E0";
  const logoUrl =
    "https://www.hypertec.co.uk/wp-content/uploads/2023/08/Hypertec-Logo-White.svg";
  const placeholderLogo =
    "https://placehold.co/150x40/1A237E/FFFFFF?text=Hypertec";

  return (
    <aside
      className={`w-64 bg-[${sidebarBgColor}] text-[${textColor}] flex flex-col`}
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div
        className={`p-4 py-5 flex justify-center items-center border-b border-[${hoverBgColor}]/50`}
      >
        <img
          src={logoUrl}
          alt="Hypertec Logo"
          className="h-8 w-auto"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderLogo;
          }}
        />
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.name)}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-3 transition-colors duration-150 ${
              activeView === item.name
                ? `bg-[${activeBgColor}] text-[${textColor}]`
                : `text-[${inactiveTextColor}] hover:bg-[${hoverBgColor}] hover:text-[${hoverTextColor}]`
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div
        className={`p-4 border-t border-[${hoverBgColor}]/50 text-xs text-gray-400`}
      >
        Role: {user?.role || "N/A"}
      </div>
    </aside>
  );
};

// Header Bar (Updated getTitle and user switching logic)
const Header = ({ user, activeView, availableUsers, onUserChange }) => {
  const handleSignOut = () => {
    console.log("Signing out...");
    alert("Sign out functionality to be implemented.");
  };
  // Update titles to match new view names
  const getTitle = (view) => {
    switch (view) {
      case "Dashboard":
        return "Dashboard";
      case "Upload Licenses":
        return "Upload Licenses";
      case "Email Templates":
        return "Email Configuration";
      case "Email Logs":
        return "Email Logs";
      case "Reports":
        return "Reports";
      case "User & Company Management":
        return "User & Company Management";
      default:
        return "Dashboard";
    }
  };
  // The value for the Select is now the user's ID
  const currentUserId = user ? user.id : "";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          {getTitle(activeView)}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* User simulator kept for testing */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="role-switcher" className="text-xs font-medium">
            Simulate User:
          </Label>
          <Select
            id="role-switcher"
            value={currentUserId}
            onChange={(e) => onUserChange(e.target.value)} // Pass the selected user ID back
            className="text-xs w-48"
          >
            <option value="" disabled>
              Select User
            </option>
            {availableUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role})
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="text-sm text-gray-600 hidden md:block">
          Welcome,{" "}
          <span className="font-medium">
            {user?.firstName} {user?.lastName}
          </span>
          !
          <span className="ml-2 text-xs text-gray-400">
            (Logged in: {user?.loginTime})
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
};

// Dashboard View Component (Updated for new fields/types)
const DashboardView = ({ user, companies, recordsData, setRecords }) => {
  // Renamed renewalsData to recordsData

  // State for sorting configuration - Default sort by renewalDue ascending
  const [sortConfig, setSortConfig] = useState({
    key: "renewalDue",
    direction: "ascending",
  });
  // State for global filter text
  const [filterText, setFilterText] = useState("");

  // Determine user role flags
  const isAdmin = user.role === ROLE_ADMIN;
  const isPartner = user.role === ROLE_PARTNER;
  const isCustomer = user.role === ROLE_CUSTOMER;

  // Get the current user's company details
  const userCompany = useMemo(
    () => getCompanyById(user.companyId, companies),
    [user.companyId, companies]
  );

  // Filter records based on user role
  const roleFilteredRecords = useMemo(() => {
    return recordsData.filter((record) => {
      if (isAdmin) return true;
      if (isPartner && userCompany)
        return record.partnerName === userCompany.name;
      if (isCustomer && userCompany)
        return record.customerName === userCompany.name;
      return false;
    });
  }, [recordsData, user, userCompany, isAdmin, isPartner, isCustomer]);

  // Apply global text filter and sorting
  const processedRecords = useMemo(() => {
    let filterableItems = [...roleFilteredRecords];
    if (filterText) {
      filterableItems = filterableItems.filter((item) => {
        const searchTerm = filterText.toLowerCase();
        let match = false;
        if (isAdmin || isPartner)
          match =
            match || item.customerName?.toLowerCase().includes(searchTerm);
        if (isAdmin)
          match = match || item.partnerName?.toLowerCase().includes(searchTerm);
        match = match || item.partcode?.toLowerCase().includes(searchTerm);
        match = match || item.serial?.toLowerCase().includes(searchTerm);
        match = match || item.renewalDue?.toLowerCase().includes(searchTerm);
        match = match || item.status?.toLowerCase().includes(searchTerm);
        match = match || item.recordType?.toLowerCase().includes(searchTerm);
        match = match || item.helReference?.toLowerCase().includes(searchTerm);
        // Add more searchable fields if needed
        return match;
      });
    }
    if (sortConfig.key !== null) {
      filterableItems.sort((a, b) => {
        /* ... sorting logic (same as before) ... */
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (sortConfig.key === "renewalDue") {
          const dateA = aValue ? new Date(aValue) : null;
          const dateB = bValue ? new Date(bValue) : null;
          if (dateA && dateB) {
            if (dateA < dateB)
              return sortConfig.direction === "ascending" ? -1 : 1;
            if (dateA > dateB)
              return sortConfig.direction === "ascending" ? 1 : -1;
            return 0;
          }
          if (dateA) return -1;
          if (dateB) return 1;
          return 0;
        }
        const valA = typeof aValue === "string" ? aValue.toLowerCase() : aValue;
        const valB = typeof bValue === "string" ? bValue.toLowerCase() : bValue;
        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return filterableItems;
  }, [roleFilteredRecords, filterText, sortConfig]);

  // Handle column header click for sorting
  const requestSort = (key) => {
    /* ... */ let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const getSortIndicator = (key) => {
    /* ... */ if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };
  // Handle delete action
  const handleDelete = (id) => {
    /* ... */ if (isAdmin || isPartner) {
      console.log(`User (${user.role}) deleting record with id:`, id);
      setRecords((prevRecords) => prevRecords.filter((r) => r.id !== id));
      alert(`Record ${id} deleted (locally).`);
    } else {
      alert("Permission denied.");
    }
  };
  // Get status badge color
  const getStatusColor = (status) => {
    /* ... */ switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expiring soon":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // Handle Toggle Change
  const handleToggleChange = (recordId, currentStatus) => {
    if (isAdmin || isPartner) {
      setRecords((prevRecords) =>
        prevRecords.map((rec) =>
          rec.id === recordId ? { ...rec, renewalEnabled: !currentStatus } : rec
        )
      );
      console.log(
        `Toggled renewalEnabled for ${recordId} to ${!currentStatus}`
      );
    } else {
      alert("Permission denied.");
    }
  };

  // Calculate colspan for empty row
  let colSpan = 0;
  if (isAdmin || isPartner) colSpan++; // Customer
  if (isAdmin) colSpan++; // Partner
  colSpan++; // Type
  colSpan++; // Partcode/Item
  colSpan++; // Serial/Vouchers
  colSpan++; // Expiry
  colSpan++; // Status/Claimed
  colSpan++; // Licenses/Qty
  if (isAdmin || isCustomer) colSpan++; // Instructions/Link
  if (isAdmin || isPartner) colSpan++; // Renewal Active Toggle
  if (isAdmin || isPartner) colSpan++; // Action

  // Mock KPI data (needs updating for voucher counts etc.)
  const kpiData = {
    expiringSoon: processedRecords.filter(
      (r) =>
        r.recordType === RECORD_TYPE_SOFTWARE && r.status === "Expiring Soon"
    ).length,
    totalActive: processedRecords.filter((r) => r.status === "Active").length,
    expired: processedRecords.filter(
      (r) => r.recordType === RECORD_TYPE_SOFTWARE && r.status === "Expired"
    ).length,
    vouchersUnclaimed: processedRecords
      .filter(
        (r) =>
          r.recordType === RECORD_TYPE_VOUCHER && r.claimedCount < r.licenses
      )
      .reduce((sum, r) => sum + (r.licenses - r.claimedCount), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* --- KPI Cards (Updated for Vouchers) --- */}
      {(isAdmin || isPartner) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Expiring Soon (Licenses)"
            value={kpiData.expiringSoon}
            description="Licenses expiring within 30 days"
            icon="⚠️"
            color="#FBC02D"
          />
          <KPICard
            title="Total Active Records"
            value={kpiData.totalActive}
            description="Active licenses and vouchers"
            icon="✔️"
            color="#4CAF50"
          />
          <KPICard
            title="Total Unclaimed Vouchers"
            value={kpiData.vouchersUnclaimed}
            description="Service vouchers yet to be redeemed"
            icon="🎫"
            color="#1E88E5"
          />
          <KPICard
            title="Expired Licenses"
            value={kpiData.expired}
            description="Licenses past their renewal date"
            icon="❌"
            color="#F44336"
          />
        </div>
      )}
      {/* --- Charts --- */}
      {(isAdmin || isPartner) && (
        <div className="grid gap-6 md:grid-cols-2">
          <PlaceholderPieChart
            title="Records by Status"
            description="Distribution based on current status."
          />
          <PlaceholderBarChart
            title="Upcoming Expiries (Next 6 Months)"
            description="Licenses/Vouchers expiring soon."
          />
        </div>
      )}
      {/* --- Records Table --- */}
      <Card>
        <CardHeader>
          <CardTitle>Licenses & Vouchers</CardTitle>
          <CardDescription>
            Overview of software licenses and service vouchers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              type="text"
              placeholder="Filter table..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-sm"
            />
            {/* Export Button Placeholder */}
            {(isAdmin || isPartner) && (
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              {" "}
              <TableRow>
                {/* Conditional Headers */}
                {(isAdmin || isPartner) && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("customerName")}
                  >
                    {" "}
                    Customer {getSortIndicator("customerName")}{" "}
                  </TableHead>
                )}
                {isAdmin && <TableHead>Partner</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Partcode/Item</TableHead>
                <TableHead>Serial/Vouchers</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("renewalDue")}
                >
                  {" "}
                  Expiry Date {getSortIndicator("renewalDue")}{" "}
                </TableHead>
                <TableHead>Status/Claimed</TableHead>
                <TableHead className="text-right">Lic./Qty</TableHead>
                {(isAdmin || isCustomer) && <TableHead>Instructions</TableHead>}
                {(isAdmin || isPartner) && (
                  <TableHead>Renewal Active</TableHead>
                )}
                {(isAdmin || isPartner) && (
                  <TableHead className="text-center">Action</TableHead>
                )}
              </TableRow>{" "}
            </TableHeader>
            <TableBody>
              {processedRecords.length > 0 ? (
                processedRecords.map((record) => (
                  <TableRow key={record.id}>
                    {/* Conditional Cells */}
                    {(isAdmin || isPartner) && (
                      <TableCell className="font-medium">
                        {record.customerName}
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>{record.partnerName || "Direct"}</TableCell>
                    )}
                    <TableCell>{record.recordType}</TableCell>
                    <TableCell>{record.partcode}</TableCell>
                    {/* Display Serial or Voucher Info */}
                    <TableCell>
                      {record.recordType === RECORD_TYPE_SOFTWARE
                        ? record.serial
                        : record.recordType === RECORD_TYPE_VOUCHER
                        ? `${record.voucherCodes?.length || 0} codes`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{record.renewalDue}</TableCell>
                    {/* Display Status or Claimed Info */}
                    <TableCell>
                      {record.recordType === RECORD_TYPE_SOFTWARE ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      ) : record.recordType === RECORD_TYPE_VOUCHER ? (
                        <span className="text-xs">
                          {record.claimedCount || 0} / {record.licenses || 0}{" "}
                          claimed
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.licenses}
                    </TableCell>
                    {(isAdmin || isCustomer) && (
                      <TableCell
                        className="text-xs truncate max-w-[150px]"
                        title={record.instructions}
                      >
                        {record.instructions}
                      </TableCell>
                    )}
                    {/* Renewal Toggle */}
                    {(isAdmin || isPartner) && (
                      <TableCell>
                        {record.recordType === RECORD_TYPE_SOFTWARE ? (
                          <Switch
                            id={`toggle-${record.id}`}
                            checked={record.renewalEnabled}
                            onCheckedChange={() =>
                              handleToggleChange(
                                record.id,
                                record.renewalEnabled
                              )
                            }
                            disabled={!isAdmin && !isPartner} // Ensure only allowed roles can toggle
                          />
                        ) : (
                          <span className="text-gray-400">-</span> // N/A for Vouchers
                        )}
                      </TableCell>
                    )}
                    {(isAdmin || isPartner) && (
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-center text-gray-500 py-8"
                  >
                    {" "}
                    No matching records found.{" "}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// File Upload Component (Now in its own view)
const FileUploadView = () => {
  /* ... FileUploadView code ... */
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    } else {
      alert("Please select a valid .xlsx file.");
      setSelectedFile(null);
      event.target.value = null;
    }
  };
  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    console.log("Uploading file:", selectedFile.name);
    alert(`Simulating upload for ${selectedFile.name}. Check console.`);
    setSelectedFile(null);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setSelectedFile(file);
      console.log("Dropped file:", file.name);
    } else {
      alert("Please drop a valid .xlsx file.");
    }
  };
  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Renewals File</CardTitle>
          <CardDescription>
            Upload an Excel (.xlsx) file containing renewal data (Licenses &
            Vouchers).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-gray-400 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 mb-4">XLSX files only</p>
            <Input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button as="span" variant="outline" size="sm">
                Choose File
              </Button>
            </label>
            {selectedFile && (
              <p className="mt-4 text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpload} disabled={!selectedFile}>
              Upload File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Email Templates Components (Updated Schedules) ---
const softwareReminderIntervals = [
  // Updated software schedule
  {
    id: "software_90day",
    label: "90 Days Before Expiry",
    defaultEnabled: true,
  },
  {
    id: "software_60day",
    label: "60 Days Before Expiry (If Unrenewed)",
    defaultEnabled: true,
  },
  {
    id: "software_expiry",
    label: "On Expiry Day (If Unrenewed)",
    defaultEnabled: true,
  },
];
const voucherReminderIntervals = [
  // New voucher schedule
  {
    id: "voucher_initial",
    label: "300 Days Before Expiry (Approx 2 months after issue)",
    defaultEnabled: true,
  },
  {
    id: "voucher_monthly",
    label: "Monthly Reminder (Until Claimed/Expiry Month)",
    defaultEnabled: true,
  },
];

const EmailTemplatesView = () => {
  // Separate state for software and voucher configs
  const [softwareConfigs, setSoftwareConfigs] = useState(() => {
    const initialState = {};
    softwareReminderIntervals.forEach((interval) => {
      initialState[interval.id] = {
        enabled: interval.defaultEnabled,
        subject: `Reminder: Your Hypertec Renewal for {{productName}}`,
        body: `Dear {{customerName}},\n\nThis is a reminder that your Hypertec license for {{productName}} (Serial: {{serialNumber}}) is due for renewal on {{expiryDate}}.\n\nPlease contact us or your partner {{partnerName}} to arrange your renewal.\n\nInstructions: {{instructions}}\n\nThanks,\nThe Hypertec Team`,
      };
    });
    return initialState;
  });
  const [voucherConfigs, setVoucherConfigs] = useState(() => {
    const initialState = {};
    voucherReminderIntervals.forEach((interval) => {
      initialState[interval.id] = {
        enabled: interval.defaultEnabled,
        subject: `Reminder: Unused Hypertec Service Vouchers`,
        body: `Dear {{customerName}},\n\nYou have {{unclaimedCount}} unused service voucher(s) associated with HEL ref {{helReference}} (Your ref: {{endUserRef}}) expiring on {{expiryDate}}.\n\n{{callToAction}}\n\nThanks,\nThe Hypertec Team`,
      };
    });
    return initialState;
  });

  // Generic toggle handler
  const handleToggle = (id, checked, configSetter) => {
    configSetter((prevConfigs) => ({
      ...prevConfigs,
      [id]: { ...prevConfigs[id], enabled: checked },
    }));
    console.log(`Toggled ${id} to ${checked}`);
  };
  // Generic template change handler
  const handleTemplateChange = (id, field, value, configSetter) => {
    configSetter((prevConfigs) => ({
      ...prevConfigs,
      [id]: { ...prevConfigs[id], [field]: value },
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Software Templates */}
      <Card>
        <CardHeader>
          {" "}
          <CardTitle>Software License Reminders</CardTitle>{" "}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule Toggles */}
          {softwareReminderIntervals.map((interval) => (
            <div
              key={interval.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
            >
              <Label
                htmlFor={`switch-${interval.id}`}
                className="cursor-pointer"
              >
                {interval.label}
              </Label>
              <Switch
                id={`switch-${interval.id}`}
                checked={softwareConfigs[interval.id]?.enabled || false}
                onCheckedChange={(checked) =>
                  handleToggle(interval.id, checked, setSoftwareConfigs)
                }
              />
            </div>
          ))}
          {/* Template Editors */}
          {softwareReminderIntervals
            .filter((i) => softwareConfigs[i.id]?.enabled)
            .map((interval) => (
              <div
                key={`${interval.id}-editor`}
                className="p-4 border rounded-md bg-white shadow-sm mt-4"
              >
                <h4 className="font-medium mb-3 text-gray-700">
                  {interval.label} Template
                </h4>
                <div className="space-y-3">
                  <div>
                    {" "}
                    <Label htmlFor={`subject-${interval.id}`}>
                      Subject
                    </Label>{" "}
                    <Input
                      id={`subject-${interval.id}`}
                      value={softwareConfigs[interval.id]?.subject || ""}
                      onChange={(e) =>
                        handleTemplateChange(
                          interval.id,
                          "subject",
                          e.target.value,
                          setSoftwareConfigs
                        )
                      }
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <Label htmlFor={`body-${interval.id}`}>Body</Label>{" "}
                    <Textarea
                      id={`body-${interval.id}`}
                      value={softwareConfigs[interval.id]?.body || ""}
                      onChange={(e) =>
                        handleTemplateChange(
                          interval.id,
                          "body",
                          e.target.value,
                          setSoftwareConfigs
                        )
                      }
                      rows={6}
                    />{" "}
                    <p className="text-xs text-gray-500 mt-1">
                      Placeholders: {"{{customerName}}"}, {"{{partnerName}}"},{" "}
                      {"{{productName}}"}, {"{{serialNumber}}"},{" "}
                      {"{{expiryDate}}"}, {"{{instructions}}"}
                    </p>{" "}
                  </div>
                </div>
              </div>
            ))}
          <div className="flex justify-end mt-4">
            {" "}
            <Button
              onClick={() =>
                alert("Save Software Templates functionality needed.")
              }
            >
              Save Software Templates
            </Button>{" "}
          </div>
        </CardContent>
      </Card>

      {/* Service Voucher Templates */}
      <Card>
        <CardHeader>
          {" "}
          <CardTitle>Service Voucher Reminders</CardTitle>{" "}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule Toggles */}
          {voucherReminderIntervals.map((interval) => (
            <div
              key={interval.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
            >
              <Label
                htmlFor={`switch-${interval.id}`}
                className="cursor-pointer"
              >
                {interval.label}
              </Label>
              <Switch
                id={`switch-${interval.id}`}
                checked={voucherConfigs[interval.id]?.enabled || false}
                onCheckedChange={(checked) =>
                  handleToggle(interval.id, checked, setVoucherConfigs)
                }
              />
            </div>
          ))}
          {/* Template Editors */}
          {voucherReminderIntervals
            .filter((i) => voucherConfigs[i.id]?.enabled)
            .map((interval) => (
              <div
                key={`${interval.id}-editor`}
                className="p-4 border rounded-md bg-white shadow-sm mt-4"
              >
                <h4 className="font-medium mb-3 text-gray-700">
                  {interval.label} Template
                </h4>
                <div className="space-y-3">
                  <div>
                    {" "}
                    <Label htmlFor={`subject-${interval.id}`}>
                      Subject
                    </Label>{" "}
                    <Input
                      id={`subject-${interval.id}`}
                      value={voucherConfigs[interval.id]?.subject || ""}
                      onChange={(e) =>
                        handleTemplateChange(
                          interval.id,
                          "subject",
                          e.target.value,
                          setVoucherConfigs
                        )
                      }
                    />{" "}
                  </div>
                  <div>
                    {" "}
                    <Label htmlFor={`body-${interval.id}`}>Body</Label>{" "}
                    <Textarea
                      id={`body-${interval.id}`}
                      value={voucherConfigs[interval.id]?.body || ""}
                      onChange={(e) =>
                        handleTemplateChange(
                          interval.id,
                          "body",
                          e.target.value,
                          setVoucherConfigs
                        )
                      }
                      rows={6}
                    />{" "}
                    <p className="text-xs text-gray-500 mt-1">
                      Placeholders: {"{{customerName}}"}, {"{{helReference}}"},{" "}
                      {"{{endUserRef}}"}, {"{{unclaimedCount}}"},{" "}
                      {"{{expiryDate}}"}, {"{{callToAction}}"}
                    </p>{" "}
                  </div>
                </div>
              </div>
            ))}
          <div className="flex justify-end mt-4">
            {" "}
            <Button
              onClick={() =>
                alert("Save Voucher Templates functionality needed.")
              }
            >
              Save Voucher Templates
            </Button>{" "}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Reports View Component --- (Simplified)
const ReportsView = () => {
  /* ... ReportsView code ... */ return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        <PlaceholderBarChart
          title="Renewals by Product (Top 5)"
          description="Most frequent products based on partcode in renewal records."
        />
      </div>
    </div>
  );
};

// --- Email Logs View Component --- (Added Resend Button)
const EmailLogsView = () => {
  const [logs] = useState(initialMockEmailLogs);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterText, setFilterText] = useState("");
  const filteredLogs = useMemo(() => {
    if (!filterText) return logs;
    const searchTerm = filterText.toLowerCase();
    return logs.filter(
      (log) =>
        log.recipient?.toLowerCase().includes(searchTerm) ||
        log.subject?.toLowerCase().includes(searchTerm) ||
        log.status?.toLowerCase().includes(searchTerm) ||
        formatTimestamp(log.timestamp)?.toLowerCase().includes(searchTerm)
    );
  }, [logs, filterText]);
  const getLogStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // Placeholder for resend action
  const handleResend = (logId) => {
    alert(`Resend functionality for log ${logId} needs to be implemented.`);
    console.log("Resend requested for log:", logId);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Send Logs</CardTitle>
          <CardDescription>
            History of automated emails sent by the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Filter logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>{log.recipient}</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={log.subject}
                    >
                      {log.subject}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getLogStatusColor(
                          log.status
                        )}`}
                      >
                        {log.status || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {" "}
                      {/* Added space-x-2 */}{" "}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        View
                      </Button>{" "}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResend(log.id)}
                      >
                        Resend
                      </Button>{" "}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-8"
                  >
                    No email logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedLog && (
        <Card className="mt-6 border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Email Details</CardTitle>
              <CardDescription>
                To: {selectedLog.recipient} | Sent:{" "}
                {formatTimestamp(selectedLog.timestamp)} | Status:{" "}
                {selectedLog.status}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLog(null)}
            >
              X
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-semibold">Subject:</span>{" "}
              {selectedLog.subject}
            </p>
            <div>
              <p className="font-semibold mb-1">Body:</p>
              <pre className="text-sm whitespace-pre-wrap p-3 bg-gray-50 rounded border font-sans">
                {selectedLog.body}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// --- User & Company Management View Component --- (Updated Structure)
const CompanyUserManagementView = ({
  usersState,
  setUsersState,
  companiesState,
  setCompaniesState,
}) => {
  /* ... CompanyUserManagementView code ... */
  const [userFormData, setUserFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    role: ROLE_CUSTOMER,
    companyId: "",
  });
  const [companyFormData, setCompanyFormData] = useState({
    id: null,
    name: "",
    type: TYPE_CUSTOMER,
  });
  const [formMode, setFormMode] = useState(null);
  const [showCompanyFormFromUser, setShowCompanyFormFromUser] = useState(false);
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddNewCompany = () => {
    setCompanyFormData({ id: null, name: "", type: TYPE_CUSTOMER });
    setFormMode("addCompany");
  };
  const handleEditCompany = (company) => {
    setCompanyFormData({
      id: company.id,
      name: company.name,
      type: company.type,
    });
    setFormMode("editCompany");
  };
  const handleCompanySubmit = (e) => {
    e.preventDefault();
    if (!companyFormData.name || !companyFormData.type) {
      alert("Please fill Company Name and Type.");
      return;
    }
    if (formMode === "addCompany") {
      const newCompany = { ...companyFormData, id: `comp-${Date.now()}` };
      setCompaniesState((prev) => [...prev, newCompany]);
      alert(`Company "${newCompany.name}" created.`);
      if (showCompanyFormFromUser) {
        setUserFormData((prev) => ({ ...prev, companyId: newCompany.id }));
        setShowCompanyFormFromUser(false);
        setFormMode("addUser");
        return;
      }
    } else if (formMode === "editCompany") {
      setCompaniesState((prev) =>
        prev.map((c) =>
          c.id === companyFormData.id ? { ...c, ...companyFormData } : c
        )
      );
      alert(`Company "${companyFormData.name}" updated.`);
    }
    setFormMode(null);
  };
  const handleDeleteCompany = (companyId, companyName) => {
    if (companyId === "comp-hypertec") {
      alert("Cannot delete the internal Hypertec company.");
      return;
    }
    const usersAssociated = usersState.some((u) => u.companyId === companyId);
    if (usersAssociated) {
      alert(
        `Cannot delete company "${companyName}" because users are still associated with it. Please reassign or delete users first.`
      );
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete company "${companyName}"?`
      )
    ) {
      setCompaniesState((prev) => prev.filter((c) => c.id !== companyId));
      alert(`Company "${companyName}" deleted.`);
      if (formMode === "editCompany" && companyFormData.id === companyId) {
        setFormMode(null);
      }
    }
  };
  const handleCompanyCancel = () => {
    if (showCompanyFormFromUser) {
      setShowCompanyFormFromUser(false);
      setFormMode("addUser");
    } else {
      setFormMode(null);
    }
  };
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddNewUser = () => {
    setUserFormData({
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      role: ROLE_CUSTOMER,
      companyId: "",
    });
    setFormMode("addUser");
    setShowCompanyFormFromUser(false);
  };
  const handleEditUser = (user) => {
    setUserFormData({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });
    setFormMode("editUser");
    setShowCompanyFormFromUser(false);
  };
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (
      !userFormData.firstName ||
      !userFormData.lastName ||
      !userFormData.email ||
      !userFormData.role ||
      (userFormData.role !== ROLE_ADMIN && !userFormData.companyId)
    ) {
      alert(
        "Please fill all required fields (First Name, Last Name, Email, Role, Company (for non-Admins))."
      );
      return;
    }
    if (formMode === "addUser") {
      const newUser = {
        ...userFormData,
        id: `user-${Date.now()}`,
        loginTime: new Date().toLocaleString(),
        companyId:
          userFormData.role === ROLE_ADMIN
            ? "comp-hypertec"
            : userFormData.companyId,
      };
      setUsersState((prev) => [...prev, newUser]);
      alert(
        `User "${newUser.firstName} ${newUser.lastName}" created. (Simulated notification)`
      );
      console.log("Simulated notification: User created", newUser);
    } else if (formMode === "editUser") {
      setUsersState((prev) =>
        prev.map((user) =>
          user.id === userFormData.id
            ? {
                ...user,
                ...userFormData,
                companyId:
                  userFormData.role === ROLE_ADMIN
                    ? "comp-hypertec"
                    : userFormData.companyId,
              }
            : user
        )
      );
      alert(
        `User "${userFormData.firstName} ${userFormData.lastName}" updated.`
      );
    }
    setFormMode(null);
  };
  const handleDeleteUser = (userId, userName) => {
    if (userId === "admin") {
      alert("Cannot delete the default admin user.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      setUsersState((prev) => prev.filter((user) => user.id !== userId));
      alert(`User "${userName}" deleted. (Simulated notification)`);
      console.log("Simulated notification: User deleted", {
        id: userId,
        name: userName,
      });
      if (formMode === "editUser" && userFormData.id === userId) {
        setFormMode(null);
      }
    }
  };
  const handleUserCancel = () => {
    setFormMode(null);
  };
  const triggerAddCompanyFromUserForm = () => {
    setFormMode("addCompany");
    setShowCompanyFormFromUser(true);
    setCompanyFormData({ id: null, name: "", type: TYPE_CUSTOMER });
  };
  const assignableCompanies = companiesState.filter((c) => c.type !== "Admin");
  const showUserForm = formMode === "addUser" || formMode === "editUser";
  const showCompanyForm =
    formMode === "addCompany" || formMode === "editCompany";
  return (
    <div className="p-6 space-y-6">
      {showCompanyForm && (
        <Card className="border-blue-200 border-2">
          <CardHeader>
            <CardTitle>
              {formMode === "addCompany" ? "Add New Company" : "Edit Company"}
            </CardTitle>
            {showCompanyFormFromUser && (
              <CardDescription>
                Create the company first, then complete adding the user.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                {" "}
                <Label htmlFor="companyName">Company Name</Label>{" "}
                <Input
                  id="companyName"
                  name="name"
                  value={companyFormData.name}
                  onChange={handleCompanyInputChange}
                  required
                />{" "}
              </div>
              <div>
                {" "}
                <Label htmlFor="companyType">Company Type</Label>{" "}
                <Select
                  id="companyType"
                  name="type"
                  value={companyFormData.type}
                  onChange={handleCompanyInputChange}
                  required
                >
                  {" "}
                  {COMPANY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}{" "}
                </Select>{" "}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                {" "}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCompanyCancel}
                >
                  Cancel
                </Button>{" "}
                <Button type="submit">
                  {formMode === "addCompany" ? "Add Company" : "Save Changes"}
                </Button>{" "}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {showUserForm && !showCompanyFormFromUser && (
        <Card className="border-green-200 border-2">
          <CardHeader>
            {" "}
            <CardTitle>
              {formMode === "addUser" ? "Add New User" : "Edit User"}
            </CardTitle>{" "}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {" "}
                  <Label htmlFor="firstName">First Name</Label>{" "}
                  <Input
                    id="firstName"
                    name="firstName"
                    value={userFormData.firstName}
                    onChange={handleUserInputChange}
                    required
                  />{" "}
                </div>
                <div>
                  {" "}
                  <Label htmlFor="lastName">Last Name</Label>{" "}
                  <Input
                    id="lastName"
                    name="lastName"
                    value={userFormData.lastName}
                    onChange={handleUserInputChange}
                    required
                  />{" "}
                </div>
              </div>
              <div>
                {" "}
                <Label htmlFor="email">Email</Label>{" "}
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  required
                />{" "}
              </div>
              <div>
                {" "}
                <Label htmlFor="role">Role</Label>{" "}
                <Select
                  id="role"
                  name="role"
                  value={userFormData.role}
                  onChange={handleUserInputChange}
                  required
                >
                  {" "}
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}{" "}
                </Select>{" "}
              </div>
              {userFormData.role !== ROLE_ADMIN && (
                <div>
                  <Label htmlFor="companyId">Company</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      id="companyId"
                      name="companyId"
                      value={userFormData.companyId}
                      onChange={handleUserInputChange}
                      required
                      className="flex-grow"
                    >
                      <option value="" disabled>
                        Select Company...
                      </option>
                      {assignableCompanies.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id}>
                          {comp.name} ({comp.type})
                        </SelectItem>
                      ))}
                    </Select>
                    {formMode === "addUser" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={triggerAddCompanyFromUserForm}
                      >
                        + New
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                {" "}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUserCancel}
                >
                  Cancel
                </Button>{" "}
                <Button type="submit">
                  {formMode === "addUser" ? "Add User" : "Save Changes"}
                </Button>{" "}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        {" "}
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            {" "}
            <CardTitle>Companies</CardTitle>{" "}
            <CardDescription>
              Manage Partner and Customer companies.
            </CardDescription>{" "}
          </div>
          {!formMode && (
            <Button onClick={handleAddNewCompany}>Add New Company</Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {" "}
              <TableRow>
                {" "}
                <TableHead>Name</TableHead> <TableHead>Type</TableHead>{" "}
                <TableHead className="text-right">Actions</TableHead>{" "}
              </TableRow>{" "}
            </TableHeader>
            <TableBody>
              {companiesState
                .filter((c) => c.type !== "Admin")
                .map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      {company.name}
                    </TableCell>
                    <TableCell>{company.type}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(company)}
                        disabled={formMode !== null}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeleteCompany(company.id, company.name)
                        }
                        disabled={formMode !== null}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        {" "}
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            {" "}
            <CardTitle>Users</CardTitle>{" "}
            <CardDescription>
              Manage users and their company association.
            </CardDescription>{" "}
          </div>
          {!formMode && (
            <Button onClick={handleAddNewUser}>Add New User</Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {" "}
              <TableRow>
                {" "}
                <TableHead>Name</TableHead> <TableHead>Email</TableHead>{" "}
                <TableHead>Role</TableHead> <TableHead>Company</TableHead>{" "}
                <TableHead className="text-right">Actions</TableHead>{" "}
              </TableRow>{" "}
            </TableHeader>
            <TableBody>
              {usersState.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {getCompanyNameById(user.companyId, companiesState)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      disabled={formMode !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDeleteUser(
                          user.id,
                          `${user.firstName} ${user.lastName}`
                        )
                      }
                      disabled={formMode !== null || user.id === "admin"}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Login View Component --- (Simplified for Mockup)
const LoginView = ({ onLoginSuccess, availableUsers }) => {
  /* ... LoginView code ... */ const handleMockLogin = (userId) => {
    onLoginSuccess(userId);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Hypertec Renewal Platform
          </CardTitle>
          <CardDescription className="text-center">
            Select User to Simulate Login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="user-select">Select User:</Label>
          <Select
            id="user-select"
            onChange={(e) => handleMockLogin(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select User --
            </option>
            {availableUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.role})
              </SelectItem>
            ))}
          </Select>
          <p className="text-center text-xs text-gray-500 pt-4">
            (Login simulation for mockup purposes)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Placeholder for inaccessible views
const AccessDeniedView = ({ title }) => (
  /* ... AccessDeniedView code ... */ <div className="p-6 text-center">
    <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
    <p className="text-gray-600">
      Your current role does not have permission to access the "{title}"
      section.
    </p>
  </div>
);

// Main App Component (Handles Mock Auth State for now)
export default function App() {
  // Lifted state for shared data
  const [users, setUsers] = useState(initialMockUsers);
  const [companies, setCompanies] = useState(initialMockCompanies);
  const [records, setRecords] = useState(initialMockRecords); // Renamed from renewals

  // --- Using Mock Auth for Simulation ---
  const [currentUserId, setCurrentUserId] = useState("admin"); // Default to Admin ID
  const currentUser = useMemo(() => {
    return (
      users.find((u) => u.id === currentUserId) ||
      users.find((u) => u.id === "admin") ||
      null
    ); // Fallback to admin or null
  }, [currentUserId, users]);
  const [authLoading, setAuthLoading] = useState(false); // Mock loading state
  // --- End Mock Auth ---

  const [activeView, setActiveView] = useState("Dashboard"); // Default to Dashboard

  // Handle user change from the simulator dropdown (updates the ID)
  const handleUserChange = (selectedUserId) => {
    const userExists = users.some((u) => u.id === selectedUserId);
    if (userExists) {
      setCurrentUserId(selectedUserId);
    } else {
      console.warn(
        `User with ID ${selectedUserId} not found, defaulting to admin.`
      );
      setCurrentUserId("admin");
    }
    setActiveView("Dashboard"); // Reset to dashboard on user change
  };

  // Sign out handler (mock version)
  const handleSignOut = () => {
    alert("Signing out (simulation).");
    setCurrentUserId("admin"); // Reset to admin for demo
    setActiveView("Dashboard");
  };

  useEffect(() => {
    // Ensure currentUser is resolved before checking roles
    if (!currentUser) return;
    // Updated allowed views
    const allowedViews = {
      [ROLE_ADMIN]: [
        "Dashboard",
        "Upload Licenses",
        "Email Templates",
        "Email Logs",
        "Reports",
        "User & Company Management",
      ],
      [ROLE_PARTNER]: [
        "Dashboard",
        "Upload Licenses",
        "Email Templates",
        "Email Logs",
        "Reports",
      ],
      [ROLE_CUSTOMER]: ["Dashboard"],
    };
    if (!allowedViews[currentUser.role]?.includes(activeView)) {
      setActiveView("Dashboard");
    }
  }, [currentUser, activeView]);

  const renderMainContent = () => {
    // Ensure currentUser is loaded before rendering views that depend on it
    if (!currentUser) {
      return <div className="p-6">Loading user data...</div>;
    }

    // Updated routing
    switch (activeView) {
      case "Dashboard":
        return (
          <DashboardView
            user={currentUser}
            companies={companies}
            recordsData={records}
            setRecords={setRecords}
          />
        ); // Pass records state
      case "Upload Licenses":
        return currentUser.role === ROLE_ADMIN ||
          currentUser.role === ROLE_PARTNER ? (
          <FileUploadView />
        ) : (
          <AccessDeniedView title="Upload Licenses" />
        );
      case "Email Templates":
        return currentUser.role === ROLE_ADMIN ||
          currentUser.role === ROLE_PARTNER ? (
          <EmailTemplatesView />
        ) : (
          <AccessDeniedView title="Email Templates" />
        );
      case "Email Logs":
        return currentUser.role === ROLE_ADMIN ||
          currentUser.role === ROLE_PARTNER ? (
          <EmailLogsView />
        ) : (
          <AccessDeniedView title="Email Logs" />
        );
      case "Reports":
        return currentUser.role === ROLE_ADMIN ||
          currentUser.role === ROLE_PARTNER ? (
          <ReportsView />
        ) : (
          <AccessDeniedView title="Reports" />
        );
      case "User & Company Management":
        return currentUser.role === ROLE_ADMIN ? (
          <CompanyUserManagementView
            usersState={users}
            setUsersState={setUsers}
            companiesState={companies}
            setCompaniesState={setCompanies}
          />
        ) : (
          <AccessDeniedView title="User & Company Management" />
        );
      default:
        setActiveView("Dashboard");
        return null;
    }
  };

  // Render Loading state (Mock version, always false)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading Application...
      </div>
    );
  }

  // Render main application using mock auth state
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {currentUser && (
        <Sidebar
          user={currentUser}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentUser && (
          <Header
            user={currentUser}
            activeView={activeView}
            availableUsers={users} // Pass the current users array for the switcher
            onUserChange={handleUserChange} // Keep simulator for now
            onSignOut={handleSignOut} // Use mock signout
          />
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
