package com.chs.society.service;

import com.chs.society.dto.UnitDto;
import com.chs.society.dto.WingDto;
import com.chs.society.model.Society;
import com.chs.society.model.Unit;
import com.chs.society.model.User;
import com.chs.society.model.Wing;
import com.chs.society.repository.SocietyRepository;
import com.chs.society.repository.UnitRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.repository.WingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final WingRepository wingRepository;
    private final UserRepository userRepository;
    private final SocietyRepository societyRepository;

    public UnitService(UnitRepository unitRepository, WingRepository wingRepository, UserRepository userRepository,
            SocietyRepository societyRepository) {
        this.unitRepository = unitRepository;
        this.wingRepository = wingRepository;
        this.userRepository = userRepository;
        this.societyRepository = societyRepository;
    }

    public List<UnitDto> getUnitsBySociety(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        if (admin.getSociety() == null)
            return List.of();

        return unitRepository.findBySocietyId(admin.getSociety().getId()).stream()
                .map(this::mapToUnitDto)
                .collect(Collectors.toList());
    }

    public List<UnitDto> getUnitsBySocietyId(UUID societyId) {
        return unitRepository.findBySocietyId(societyId).stream()
                .map(this::mapToUnitDto)
                .collect(Collectors.toList());
    }

    public List<WingDto> getWingsBySociety(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        if (admin.getSociety() == null)
            return List.of();

        return getWingsBySocietyId(admin.getSociety().getId());
    }

    public List<WingDto> getWingsBySocietyId(UUID societyId) {
        return wingRepository.findBySocietyId(societyId).stream()
                .map(w -> WingDto.builder().id(w.getId()).name(w.getName()).build())
                .collect(Collectors.toList());
    }

    @Transactional
    public UnitDto addUnit(String adminEmail, UnitDto unitDto) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        Society society = admin.getSociety();

        // Ensure wing exists or create a default one if none provided
        Wing wing;
        if (unitDto.getWingId() != null) {
            wing = wingRepository.findById(java.util.Objects.requireNonNull(unitDto.getWingId())).orElseThrow();
        } else {
            // Find or create a default "Main" wing
            wing = wingRepository.findBySocietyId(society.getId()).stream()
                    .findFirst()
                    .orElseGet(() -> wingRepository.save(
                            java.util.Objects.requireNonNull(Wing.builder().name("Main").society(society).build())));
        }

        Unit unit = Unit.builder()
                .unitNumber(unitDto.getUnitNumber())
                .unitType(unitDto.getUnitType())
                .areaSqft(unitDto.getAreaSqft())
                .ownerName(unitDto.getOwnerName())
                .occupied(unitDto.isOccupied())
                .wing(wing)
                .build();

        if (unitDto.getOwnerId() != null) {
            User owner = userRepository.findById(unitDto.getOwnerId()).orElse(null);
            if (owner != null) {
                unit.setOwner(owner);
                unit.setOwnerName(owner.getFirstName() + " " + owner.getLastName());
            }
        }

        return mapToUnitDto(unitRepository.save(java.util.Objects.requireNonNull(unit)));
    }

    @Transactional
    public UnitDto updateUnit(String adminEmail, UUID id, UnitDto unitDto) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        Society society = admin.getSociety();
        if (society == null)
            throw new RuntimeException("Unauthorized");

        Unit unit = unitRepository.findById(id).orElseThrow(() -> new RuntimeException("Unit not found"));
        if (!unit.getWing().getSociety().getId().equals(society.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        unit.setUnitNumber(unitDto.getUnitNumber());
        unit.setUnitType(unitDto.getUnitType());
        unit.setAreaSqft(unitDto.getAreaSqft());
        unit.setOwnerName(unitDto.getOwnerName());
        unit.setOccupied(unitDto.isOccupied());

        if (unitDto.getOwnerId() != null) {
            User owner = userRepository.findById(unitDto.getOwnerId()).orElse(null);
            if (owner != null) {
                unit.setOwner(owner);
                unit.setOwnerName(owner.getFirstName() + " " + owner.getLastName());
            } else {
                unit.setOwner(null);
            }
        } else {
            unit.setOwner(null);
        }

        if (unitDto.getWingId() != null && !unit.getWing().getId().equals(unitDto.getWingId())) {
            Wing wing = wingRepository.findById(unitDto.getWingId()).orElseThrow();
            unit.setWing(wing);
        }

        return mapToUnitDto(unitRepository.save(unit));
    }

    @Transactional
    public void deleteUnit(String adminEmail, UUID id) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        if (admin.getSociety() == null)
            throw new RuntimeException("Unauthorized");

        Unit unit = unitRepository.findById(id).orElseThrow(() -> new RuntimeException("Unit not found"));
        if (!unit.getWing().getSociety().getId().equals(admin.getSociety().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        unitRepository.delete(unit);
    }

    @Transactional
    public WingDto addWing(String adminEmail, String name) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        Society society = admin.getSociety();
        return addWingForSocietyId(society.getId(), name);
    }

    @Transactional
    public WingDto addWingForSocietyId(UUID societyId, String name) {
        Society society = societyRepository.findById(societyId)
                .orElseThrow(() -> new RuntimeException("Society not found"));
        Wing wing = Wing.builder().name(name).society(society).build();
        wing = wingRepository.save(java.util.Objects.requireNonNull(wing));
        return WingDto.builder().id(wing.getId()).name(wing.getName()).build();
    }

    private UnitDto mapToUnitDto(Unit unit) {
        return UnitDto.builder()
                .id(unit.getId())
                .unitNumber(unit.getUnitNumber())
                .unitType(unit.getUnitType())
                .areaSqft(unit.getAreaSqft())
                .ownerName(unit.getOwnerName())
                .ownerId(unit.getOwner() != null ? unit.getOwner().getId() : null)
                .occupied(unit.isOccupied())
                .wingId(unit.getWing().getId())
                .wingName(unit.getWing().getName())
                .build();
    }
}
