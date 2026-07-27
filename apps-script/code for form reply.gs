function onFormSubmit(e) {

  // Email recipients eg: "address1@gmail.com, adress2@domain.co.za"
  const recipient = "martinsdominic1@gmail.com, website.insf@gmail.com";

  // Get all responses
  const responses = e.response.getItemResponses();

  // Find the requester's name
  let requesterName = "Unknown";
  let requesterEmail = "";

  responses.forEach(function(r) {
    if (r.getItem().getTitle() === "Full Name") {   // <-- Change this to your question title
      requesterName = r.getResponse();
    }
    if (r.getItem().getTitle() === "Email Address") {  // <-- Change to your question title
      requesterEmail = r.getResponse();
    }
  });

  // Email subject
  const subject = `Hall Rental Request - ${requesterName}`;

  // Subject/body for the reply email
  const replySubject = `Re: Hall Rental Request - ${requesterName}`;
  const replyBody = `Hi ${requesterName},\n\n`;
  const mailtoLink =
  `mailto:${requesterEmail}` +
  `?subject=${encodeURIComponent(replySubject)}` +
  `&body=${encodeURIComponent(replyBody)}`;

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
  <br><br>
    <a href="${mailtoLink}"
       style="background-color:#1a73e8; color:#ffffff; padding:12px 20px;
              text-decoration:none; border-radius:4px; font-family:Arial,sans-serif;
              display:inline-block;">
      Click here to reply to ${requesterName}
    </a>
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
