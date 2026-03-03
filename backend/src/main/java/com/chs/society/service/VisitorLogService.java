package com.chs.society.service;

import com.chs.society.dto.VisitorLogDto;
import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.model.VisitorLog;
import com.chs.society.repository.UserRepository;
import com.chs.society.repository.VisitorLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisitorLogService {
    private final VisitorLogRepository repository;
    private final UserRepository userRepository;

    public List<VisitorLogDto> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            return List.of();
        return repository.findBySocietyIdOrderByEntryTimeDesc(user.getSociety().getId()).stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VisitorLogDto saveVisitor(String email, VisitorLogDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            throw new RuntimeException("User has no society");
        Society society = user.getSociety();
        VisitorLog entity = new VisitorLog();
        entity.setSociety(society);
        entity.setName(dto.getName() != null ? dto.getName() : "");
        entity.setPhone(dto.getPhone() != null ? dto.getPhone() : "");
        entity.setPurpose(dto.getUnit() != null ? dto.getUnit() : "");
        if (dto.getType() != null) {
            try {
                entity.setType(VisitorLog.VisitorType.valueOf(dto.getType().toUpperCase()));
            } catch (Exception e) {
            }
        }
        entity.setEntryTime(LocalDateTime.now());
        repository.save(java.util.Objects.requireNonNull(entity));
        return mapToDto(entity);
    }

    private VisitorLogDto mapToDto(VisitorLog entity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return VisitorLogDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .unit(entity.getPurpose())
                .type(entity.getType() != null ? entity.getType().name() : "")
                .time(entity.getEntryTime() != null ? entity.getEntryTime().format(formatter) : "")
                .exitTime(entity.getExitTime() != null ? entity.getExitTime().format(formatter) : "")
                .status(entity.getExitTime() == null ? "IN" : "OUT")
                .build();
    }
}
