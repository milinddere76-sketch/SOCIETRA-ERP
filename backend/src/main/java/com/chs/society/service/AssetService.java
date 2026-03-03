package com.chs.society.service;

import com.chs.society.dto.AssetDto;
import com.chs.society.model.Asset;
import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.repository.AssetRepository;
import com.chs.society.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository repository;
    private final UserRepository userRepository;

    public List<AssetDto> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            return List.of();
        return repository.findBySocietyIdOrderByIdDesc(user.getSociety().getId()).stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AssetDto saveAsset(String email, AssetDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            throw new RuntimeException("User has no society");
        Society society = user.getSociety();
        Asset entity = new Asset();
        entity.setSociety(society);
        entity.setName(dto.getName() != null ? dto.getName() : "");
        entity.setCategory(dto.getCategory() != null ? dto.getCategory() : "");
        entity.setLocation(dto.getLocation() != null ? dto.getLocation() : "");
        entity.setConditionStatus(Asset.AssetCondition.GOOD);
        entity.setPurchaseDate(LocalDate.now());

        if (dto.getCost() != null) {
            try {
                String costStr = dto.getCost().replace("₹", "").replace(",", "").trim();
                entity.setCost(new BigDecimal(costStr));
            } catch (Exception e) {
            }
        }

        if (dto.getNextService() != null && !dto.getNextService().isEmpty()) {
            try {
                // frontend sends ISO date like "2024-12-31" or format like "12 Jul 2024"
                if (dto.getNextService().contains("-") && dto.getNextService().length() == 10) {
                    entity.setWarrantyExpiry(LocalDate.parse(dto.getNextService()));
                } else {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
                    entity.setWarrantyExpiry(LocalDate.parse(dto.getNextService(), formatter));
                }
            } catch (Exception e) {
            }
        }

        repository.save(entity);
        return mapToDto(entity);
    }

    private AssetDto mapToDto(Asset entity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        return AssetDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .location(entity.getLocation())
                .status(entity.getConditionStatus() != null ? entity.getConditionStatus().name() : "GOOD")
                .cost(entity.getCost() != null ? "₹" + entity.getCost().toString() : "₹0")
                .lastService(entity.getPurchaseDate() != null ? entity.getPurchaseDate().format(formatter) : "")
                .nextService(entity.getWarrantyExpiry() != null ? entity.getWarrantyExpiry().format(formatter) : "")
                .build();
    }
}
