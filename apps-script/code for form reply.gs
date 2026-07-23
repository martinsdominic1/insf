function onFormSubmit(e) {

  // Email recipients eg: "martinsdominic1@gmail.com, 2658093@students.wits.ac.za""
  const recipient = "martinsdominic1@gmail.com";

  // Get all responses
  const responses = e.response.getItemResponses();

  // Find the requester's name
  let requesterName = "Unknown";

  responses.forEach(function(r) {
    if (r.getItem().getTitle() === "Full Name") {   // <-- Change this to your question title
      requesterName = r.getResponse();
    }
  });

  // Email subject
  const subject = `Hall Rental Request - ${requesterName}`;

  // Build HTML email
  let html = `
    <h2>Hall Rental Request</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
  `;

  responses.forEach(function(r) {
    html += `
      <tr>
        <th align="left">${r.getItem().getTitle()}</th>
        <td>${r.getResponse()}</td>
      </tr>
    `;
  });

  html += `
    </table>
    <br>
    <b>Submitted:</b> ${new Date().toLocaleString()}
  `;

  // Send email
  GmailApp.sendEmail(
    recipient,
    subject,
    `A new hall rental request has been submitted by ${requesterName}.`,
    {
      htmlBody: html
    }
  );
}