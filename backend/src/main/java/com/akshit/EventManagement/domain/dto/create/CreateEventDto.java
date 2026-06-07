package com.akshit.EventManagement.domain.dto.create;

import com.akshit.EventManagement.domain.enums.EventStatusEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateEventDto {

    @NotBlank(message = "Event name is required")
    private String name;

    @NotNull(message = "Event start time is required")
    private LocalDateTime start;

    @NotNull(message = "Event end time is required")
    private LocalDateTime end;

    @NotBlank(message = "Venue details are required")
    private String venue;

    private LocalDateTime salesStart;
    private LocalDateTime salesEnd;

    @NotNull(message = "Status is required")
    private EventStatusEnum status;

    private String bannerImage;

    @NotEmpty(message = "Please provide at least one ticket type")
    @Valid
    private List<CreateTicketTypeDto> ticketTypes;

    // ── Cross-field date validations ────────────────────────────────────────

    @AssertTrue(message = "Event end must be after event start")
    public boolean isEndAfterStart() {
        return start == null || end == null || end.isAfter(start);
    }

    @AssertTrue(message = "Sales window must end before the event starts")
    public boolean isSalesWindowValid() {
        if (salesStart == null || salesEnd == null) return true;
        return salesStart.isBefore(salesEnd)
                && (start == null || salesEnd.isBefore(start));
    }

    @AssertTrue(message = "Event start must be in the future")
    public boolean isStartInFuture() {
        return start == null || start.isAfter(LocalDateTime.now());
    }
}
