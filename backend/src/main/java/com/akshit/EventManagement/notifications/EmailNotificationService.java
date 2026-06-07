package com.akshit.EventManagement.notifications;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService implements NotificationService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy 'at' h:mm a");

    private final JavaMailSender    mailSender;
    private final TemplateEngine    templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name:Ticket Platform}")
    private String fromName;

    @Override
    public void sendTicketConfirmation(TicketConfirmationData data) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true = multipart (for inline images + attachments), true = UTF-8
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(data.attendeeEmail());
            helper.setSubject("Your ticket for " + data.eventName() + " 🎟️");

            // Build Thymeleaf context
            Context ctx = new Context();
            ctx.setVariable("attendeeName",   data.attendeeName());
            ctx.setVariable("ticketId",       data.ticketId().toString().toUpperCase());
            ctx.setVariable("ticketTypeName", data.ticketTypeName());
            ctx.setVariable("ticketPrice",    String.format("₹%.2f", data.ticketPrice()));
            ctx.setVariable("eventName",      data.eventName());
            ctx.setVariable("eventVenue",     data.eventVenue());
            ctx.setVariable("eventStart",     data.eventStart().format(DATE_FMT));
            ctx.setVariable("eventEnd",       data.eventEnd().format(DATE_FMT));
            ctx.setVariable("qrCodeCid",      "qrcode");   // CID reference used in the template

            String htmlContent = templateEngine.process("email/ticket-confirmation", ctx);
            helper.setText(htmlContent, true);   // true = isHtml

            // Embed the QR code PNG as an inline image (CID: qrcode)
            helper.addInline("qrcode",
                    new ByteArrayResource(data.qrCodeBytes()),
                    "image/png");

            // Also attach it so attendees can save it separately
            helper.addAttachment(
                    "ticket-qr-" + data.ticketId() + ".png",
                    new ByteArrayResource(data.qrCodeBytes()),
                    "image/png");

            mailSender.send(message);
            log.info("Confirmation email sent to {} for ticketId={}", data.attendeeEmail(), data.ticketId());

        } catch (MessagingException | java.io.UnsupportedEncodingException ex) {
            // Log and absorb — must not propagate (dispatcher isolates channels)
            log.error("Failed to send confirmation email to {} for ticketId={}: {}",
                    data.attendeeEmail(), data.ticketId(), ex.getMessage(), ex);
        }
    }
}
