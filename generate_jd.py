from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size = 15)
pdf.cell(200, 10, txt = "Job Description: Senior Test Engineer", ln = True, align = 'C')
pdf.set_font("Arial", size = 12)
pdf.multi_cell(0, 10, txt = "We are looking for a Senior Test Engineer with strong Playwright skills. You will be responsible for building automated test frameworks, writing E2E tests, and ensuring our web applications are bug-free. Requirements: 5+ years of experience, knowledge of CI/CD, and strong JavaScript/TypeScript skills.")
pdf.output("fixtures/dummy_jd.pdf")
