package com.chs.society.controller;

import com.chs.society.dto.DefaulterPredictionDTO;
import com.chs.society.service.PredictionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final PredictionService predictionService;

    public AnalyticsController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/defaulter-predictions")
    public List<DefaulterPredictionDTO> getPredictions(@RequestParam UUID societyId) {
        return predictionService.getDefaulterPredictions(societyId);
    }
}
