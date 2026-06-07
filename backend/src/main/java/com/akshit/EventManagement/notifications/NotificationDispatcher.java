package com.akshit.EventManagement.notifications;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Dispatches a TicketConfirmationData to every registered NotificationService
 * on a dedicated async thread pool (see AsyncConfig).
 *
 * Calling this after ticketRepository.save() keeps notifications fully
 * decoupled from the purchase transaction — a failed email never rolls back
 * a valid ticket.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationDispatcher {

    private final List<NotificationService> channels;

    /**
     * Fire all channels asynchronously.
     * The @Async annotation means this method returns immediately to the
     * caller; each channel runs on the "notificationExecutor" thread pool.
     */
    @Async("notificationExecutor")
    public void dispatch(TicketConfirmationData data) {
        log.info("Dispatching ticket confirmation for ticketId={} via {} channel(s)",
                data.ticketId(), channels.size());
        for (NotificationService channel : channels) {
            try {
                channel.sendTicketConfirmation(data);
            } catch (Exception ex) {
                // Isolated catch — one failing channel never affects the others
                log.error("Notification channel {} failed for ticketId={}: {}",
                        channel.getClass().getSimpleName(), data.ticketId(), ex.getMessage(), ex);
            }
        }
    }
}
