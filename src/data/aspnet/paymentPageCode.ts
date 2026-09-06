export const paymentPageAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="paymentpage.aspx.cs" Inherits="R_WApp.paymentpage" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Payment Details</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
        }

        body {
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        .droplets {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .drop {
            fill: rgba(255,255,255,.30);
            animation: flow linear infinite;
        }

        @keyframes flow {
            0% { transform: translate(-500px, -500px); }
            100% { transform: translate(500px, 500px); }
        }

        .main-container {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 960px;
            background: rgba(8, 41, 84, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            padding: 30px;
            backdrop-filter: blur(10px);
        }

        .page-title {
            text-align: center;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 1.5px;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .status-box-container {
            display: flex;
            justify-content: center;
            margin-bottom: 25px;
        }

        .status-box {
            padding: 12px 36px;
            border-radius: 9999px;
            text-align: center;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: inline-block;
        }

        .status-paid {
            background: linear-gradient(135deg, #2e7d32, #1b5e20);
            border: 1px solid #81c784;
            color: #ffffff;
        }

        .status-not-paid {
            background: linear-gradient(135deg, #c62828, #8e0000);
            border: 1px solid #ef9a9a;
            color: #ffffff;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 25px;
        }

        @media (max-width: 768px) {
            .details-grid {
                grid-template-columns: 1fr;
            }
        }

        .panel-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 20px;
        }

        .panel-header {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            letter-spacing: 0.5px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            font-size: 14px;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: #b0c7e2;
            font-weight: 600;
        }

        .detail-value {
            font-weight: 700;
            color: #ffffff;
        }

        .grand-total-container {
            display: flex;
            justify-content: center;
            margin-bottom: 25px;
        }

        .grand-total-card {
            background: linear-gradient(135deg, rgba(27, 98, 191, 0.7), rgba(15, 67, 138, 0.9));
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 14px;
            padding: 16px 40px;
            text-align: center;
            box-shadow: 0 6px 20px rgba(0,0,0,0.35);
        }

        .grand-total-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #cfe2ff;
            margin-bottom: 4px;
        }

        .grand-total-amount {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
        }

        .footer-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
        }

        .btn-hub {
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            border-radius: 9999px;
            padding: 10px 28px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
        }

        .btn-hub:hover {
            background: linear-gradient(135deg, #2475e2, #1456b3);
            transform: translateY(-2px);
        }

        .error-message {
            background: rgba(220, 53, 69, 0.25);
            border: 1px solid #dc3545;
            color: #ffcdd2;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>

    <form id="form1" runat="server">
        <div class="main-container">
            <h1 class="page-title">PAYMENT DETAILS</h1>

            <asp:Label ID="lblErrorMessage" runat="server" CssClass="error-message" Visible="false"></asp:Label>

            <!-- Centered Payment Status Box -->
            <div class="status-box-container">
                <asp:Panel ID="pnlStatus" runat="server" CssClass="status-box status-not-paid">
                    Payment Status: <asp:Label ID="lblOverallStatus" runat="server" Text="NOT PAID"></asp:Label>
                </asp:Panel>
            </div>

            <!-- Two Column Details Grid -->
            <div class="details-grid">
                <!-- Left Panel: Water Details -->
                <div class="panel-card">
                    <div class="panel-header">WATER BILL DETAILS</div>
                    <div class="detail-row">
                        <span class="detail-label">DATE:</span>
                        <asp:Label ID="lblWaterDate" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">DAY:</span>
                        <asp:Label ID="lblWaterDay" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">CURRENT READINGS:</span>
                        <asp:Label ID="lblWaterCurrentReadings" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">PREVIOUS READINGS:</span>
                        <asp:Label ID="lblWaterPreviousReadings" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">KITCHEN:</span>
                        <asp:Label ID="lblWaterKitchen" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">TOTAL BILL:</span>
                        <asp:Label ID="lblWaterTotalBill" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">BALANCE:</span>
                        <asp:Label ID="lblWaterBalance" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">TOTAL:</span>
                        <asp:Label ID="lblWaterTotal" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">PAID:</span>
                        <asp:Label ID="lblWaterPaid" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                </div>

                <!-- Right Panel: Rent Details -->
                <div class="panel-card">
                    <div class="panel-header">RENT DETAILS</div>
                    <div class="detail-row">
                        <span class="detail-label">DATE:</span>
                        <asp:Label ID="lblRentDate" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">DAY:</span>
                        <asp:Label ID="lblRentDay" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">PAYMENT:</span>
                        <asp:Label ID="lblRentPayment" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">BALANCE:</span>
                        <asp:Label ID="lblRentBalance" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">TOTAL:</span>
                        <asp:Label ID="lblRentTotal" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">MODE OF PAYMENT:</span>
                        <asp:Label ID="lblRentModeOfPayment" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">PAID:</span>
                        <asp:Label ID="lblRentPaid" runat="server" CssClass="detail-value" Text="-"></asp:Label>
                    </div>
                </div>
            </div>

            <!-- Centered Grand Total Box -->
            <div class="grand-total-container">
                <div class="grand-total-card">
                    <div class="grand-total-title">Grand Total (Rent + Water)</div>
                    <div class="grand-total-amount">
                        <asp:Label ID="lblGrandTotal" runat="server" Text="₹ 0.00"></asp:Label>
                    </div>
                </div>
            </div>

            <!-- Footer Navigation -->
            <div class="footer-actions">
                <div>
                    <asp:Label ID="lblTenantInfo" runat="server" ForeColor="#b0c7e2" Font-Size="13px"></asp:Label>
                </div>
                <div>
                    <asp:Button ID="btnBack" runat="server" Text="Back" CssClass="btn-hub" OnClick="btnBack_Click" />
                </div>
            </div>
        </div>
    </form>

    <script>
        const svg = document.getElementById("droplets");
        if (svg) {
            for (let i = 0; i < 100; i++) {
                const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                c.setAttribute("cx", Math.random() * window.innerWidth);
                c.setAttribute("cy", Math.random() * window.innerHeight);
                c.setAttribute("r", Math.random() * 3 + 1.2);
                c.setAttribute("class", "drop");
                c.style.animationDuration = (4 + Math.random() * 6) + "s";
                c.style.animationDelay = (-Math.random() * 8) + "s";
                c.style.opacity = .18 + Math.random() * .8;
                svg.appendChild(c);
            }
        }
    </script>
</body>
</html>`;

export const paymentPageCs = `using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Web.UI;

namespace R_WApp
{
    public partial class paymentpage : Page
    {
        private class TenantTableInfo
        {
            public string RentTable { get; set; }
            public string WaterTable { get; set; }
        }

        private TenantTableInfo GetTenantTables(string tenantNumber)
        {
            Dictionary<string, TenantTableInfo> tableMap =
                new Dictionary<string, TenantTableInfo>(StringComparer.OrdinalIgnoreCase)
            {
                { "11", new TenantTableInfo { RentTable = "RENT_11", WaterTable = "Water_11" } },
                { "12", new TenantTableInfo { RentTable = "RENT_12", WaterTable = "Water_12" } },
                { "21", new TenantTableInfo { RentTable = "RENT_21", WaterTable = "Water_21" } },
                { "22", new TenantTableInfo { RentTable = "RENT_22", WaterTable = "Water_22" } },
                { "31", new TenantTableInfo { RentTable = "RENT_31", WaterTable = "Water_31" } },
                { "32", new TenantTableInfo { RentTable = "RENT_32", WaterTable = "Water_32" } },
                { "41", new TenantTableInfo { RentTable = "RENT_41", WaterTable = "Water_41" } }
            };

            if (string.IsNullOrWhiteSpace(tenantNumber) || !tableMap.ContainsKey(tenantNumber.Trim()))
            {
                throw new Exception("Invalid tenant number.");
            }

            return tableMap[tenantNumber.Trim()];
        }

        private bool IsRecordPaid(string paidText)
        {
            if (string.IsNullOrWhiteSpace(paidText))
                return false;

            string clean = paidText.Trim().ToLowerInvariant();
            return clean == "paid" || clean == "yes" || clean == "1";
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Authenticate session
                if (Session["UserName"] == null)
                {
                    Response.Redirect("customerloginpage.aspx");
                    return;
                }

                string tenantNumber = Session["UserName"].ToString();
                lblTenantInfo.Text = "Logged in as Tenant " + tenantNumber;

                LoadPaymentDetails(tenantNumber);
            }
        }

        private void LoadPaymentDetails(string tenantNumber)
        {
            try
            {
                TenantTableInfo tables = GetTenantTables(tenantNumber);
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

                decimal rentTotalAmount = 0m;
                decimal waterTotalAmount = 0m;
                bool isRentPaid = false;
                bool isWaterPaid = false;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();

                    // 1. Fetch Latest Water Bill Details
                    string waterQuery = "SELECT TOP 1 [DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], " +
                                       "[KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID] " +
                                       "FROM [" + tables.WaterTable + "] " +
                                       "ORDER BY [DATE] DESC";

                    using (SqlCommand cmdWater = new SqlCommand(waterQuery, conn))
                    {
                        using (SqlDataAdapter daWater = new SqlDataAdapter(cmdWater))
                        {
                            DataTable dtWater = new DataTable();
                            daWater.Fill(dtWater);

                            if (dtWater.Rows.Count > 0)
                            {
                                DataRow row = dtWater.Rows[0];
                                lblWaterDate.Text = row["DATE"] != DBNull.Value ? Convert.ToDateTime(row["DATE"]).ToString("dd/MM/yyyy") : "-";
                                lblWaterDay.Text = row["DAY"] != DBNull.Value ? row["DAY"].ToString() : "-";
                                lblWaterCurrentReadings.Text = row["CURRENT_READINGS"] != DBNull.Value ? row["CURRENT_READINGS"].ToString() : "-";
                                lblWaterPreviousReadings.Text = row["PREVIOUS_READINGS"] != DBNull.Value ? row["PREVIOUS_READINGS"].ToString() : "-";
                                lblWaterKitchen.Text = row["KITCHEN"] != DBNull.Value ? Convert.ToDecimal(row["KITCHEN"]).ToString("F2") : "-";
                                lblWaterTotalBill.Text = row["TOTAL_BILL"] != DBNull.Value ? Convert.ToDecimal(row["TOTAL_BILL"]).ToString("F2") : "-";
                                lblWaterBalance.Text = row["BALANCE"] != DBNull.Value ? Convert.ToDecimal(row["BALANCE"]).ToString("F2") : "-";
                                
                                if (row["TOTAL"] != DBNull.Value && decimal.TryParse(row["TOTAL"].ToString(), out decimal wTotal))
                                {
                                    waterTotalAmount = wTotal;
                                    lblWaterTotal.Text = "₹ " + waterTotalAmount.ToString("N2", new CultureInfo("en-IN"));
                                }
                                else
                                {
                                    lblWaterTotal.Text = "-";
                                }

                                string waterPaidStr = row["PAID"] != DBNull.Value ? row["PAID"].ToString() : "";
                                lblWaterPaid.Text = !string.IsNullOrEmpty(waterPaidStr) ? waterPaidStr : "-";
                                isWaterPaid = IsRecordPaid(waterPaidStr);
                            }
                            else
                            {
                                lblWaterDate.Text = "-";
                                lblWaterDay.Text = "-";
                                lblWaterCurrentReadings.Text = "-";
                                lblWaterPreviousReadings.Text = "-";
                                lblWaterKitchen.Text = "-";
                                lblWaterTotalBill.Text = "-";
                                lblWaterBalance.Text = "-";
                                lblWaterTotal.Text = "-";
                                lblWaterPaid.Text = "NO RECORD";
                            }
                        }
                    }

                    // 2. Fetch Latest Rent Details
                    string rentQuery = "SELECT TOP 1 [DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID] " +
                                      "FROM [" + tables.RentTable + "] " +
                                      "ORDER BY [DATE] DESC";

                    using (SqlCommand cmdRent = new SqlCommand(rentQuery, conn))
                    {
                        using (SqlDataAdapter daRent = new SqlDataAdapter(cmdRent))
                        {
                            DataTable dtRent = new DataTable();
                            daRent.Fill(dtRent);

                            if (dtRent.Rows.Count > 0)
                            {
                                DataRow row = dtRent.Rows[0];
                                lblRentDate.Text = row["DATE"] != DBNull.Value ? Convert.ToDateTime(row["DATE"]).ToString("dd/MM/yyyy") : "-";
                                lblRentDay.Text = row["DAY"] != DBNull.Value ? row["DAY"].ToString() : "-";
                                lblRentPayment.Text = row["PAYMENT"] != DBNull.Value ? Convert.ToDecimal(row["PAYMENT"]).ToString("F2") : "-";
                                lblRentBalance.Text = row["BALANCE"] != DBNull.Value ? Convert.ToDecimal(row["BALANCE"]).ToString("F2") : "-";
                                
                                if (row["TOTAL"] != DBNull.Value && decimal.TryParse(row["TOTAL"].ToString(), out decimal rTotal))
                                {
                                    rentTotalAmount = rTotal;
                                    lblRentTotal.Text = "₹ " + rentTotalAmount.ToString("N2", new CultureInfo("en-IN"));
                                }
                                else
                                {
                                    lblRentTotal.Text = "-";
                                }

                                lblRentModeOfPayment.Text = row["MODE OF PAYMENT"] != DBNull.Value ? row["MODE OF PAYMENT"].ToString() : "-";

                                string rentPaidStr = row["PAID"] != DBNull.Value ? row["PAID"].ToString() : "";
                                lblRentPaid.Text = !string.IsNullOrEmpty(rentPaidStr) ? rentPaidStr : "-";
                                isRentPaid = IsRecordPaid(rentPaidStr);
                            }
                            else
                            {
                                lblRentDate.Text = "-";
                                lblRentDay.Text = "-";
                                lblRentPayment.Text = "-";
                                lblRentBalance.Text = "-";
                                lblRentTotal.Text = "-";
                                lblRentModeOfPayment.Text = "-";
                                lblRentPaid.Text = "NO RECORD";
                            }
                        }
                    }
                }

                // 3. Compute Grand Total = Rent Total + Water Total
                decimal grandTotal = rentTotalAmount + waterTotalAmount;
                lblGrandTotal.Text = "₹ " + grandTotal.ToString("N2", new CultureInfo("en-IN"));

                // 4. Determine Combined Payment Status
                // Only display PAID when both required records are paid
                if (isRentPaid && isWaterPaid)
                {
                    lblOverallStatus.Text = "PAID";
                    pnlStatus.CssClass = "status-box status-paid";
                }
                else
                {
                    lblOverallStatus.Text = "NOT PAID";
                    pnlStatus.CssClass = "status-box status-not-paid";
                }
            }
            catch (Exception ex)
            {
                lblErrorMessage.Text = "Unable to load payment details: " + ex.Message;
                lblErrorMessage.Visible = true;
            }
        }

        protected void btnBack_Click(object sender, EventArgs e)
        {
            Response.Redirect("customermainpage.aspx");
        }
    }
}`;
