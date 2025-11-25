export const calculateLinearRegression = (data) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  data.forEach(d => {
    sumX += d.period;
    sumY += d.revenue;
    sumXY += (d.period * d.revenue);
    sumXX += (d.period * d.period);
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map(d => ({
    ...d,
    regression: Math.round(intercept + slope * d.period)
  }));
};

export const calculateExponentialSmoothing = (data, alpha = 0.5) => {
  let forecast = data[0].revenue || 0; 
  return data.map((d, index) => {
    if (index === 0) return { ...d, smoothing: d.revenue };
    const prevRevenue = data[index - 1].revenue ?? forecast;
    forecast = alpha * prevRevenue + (1 - alpha) * forecast;
    return { ...d, smoothing: Math.round(forecast) };
  });
};

export const calculateMovingAverage = (data, window = 3) => {
  return data.map((d, index) => {
    if (index < window - 1) return { ...d, movingAvg: null };
    let sum = 0;
    for (let i = 0; i < window; i++) {
      const val = data[index - i].revenue;
      if (val !== undefined) sum += val;
    }
    return { ...d, movingAvg: Math.round(sum / window) };
  });
};

export const generatePredictiveData = (baseData) => {
  if (!baseData || baseData.length === 0) return [];
  let processed = calculateLinearRegression(baseData);
  processed = calculateExponentialSmoothing(processed, 0.5);
  processed = calculateMovingAverage(processed, 3);
  
  const lastPeriod = baseData[baseData.length - 1].period;
  const lastReg = processed[processed.length - 1].regression ?? 0;
  const firstReg = processed[0].regression ?? 0;
  const slope = (lastReg - firstReg) / (processed.length - 1);
  const intercept = firstReg;

  for(let i=1; i<=3; i++) {
    const nextP = lastPeriod + i;
    const linReg = Math.round(intercept + slope * nextP);
    processed.push({
      period: nextP,
      revenue: 0, 
      regression: linReg,
      smoothing: undefined,
      movingAvg: null,
      isForecast: true
    });
  }
  return processed;
};