package com.chs.society.controller;

import com.chs.society.model.Asset;
import com.chs.society.repository.AssetRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetRepository assetRepository;

    public AssetController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public List<Asset> getAssets(@RequestParam UUID societyId) {
        return assetRepository.findBySocietyId(societyId);
    }

    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return assetRepository.save(asset);
    }
}
