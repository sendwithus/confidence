# How It Works

**Confidence.js** provides two methods for calculating the statistical significance of an A/B Test:
- The Z-Test Method
- Chi-Square Test and Marascuillo's Procedure

Both methods are ultimately similar for two variants, but the Z-Test Method tends to require a larger sample size. Since the Chi-Square/Marascuillo method controls for familywise error rate, we recommend that method is used for more than two variants.

## The Z-Test Method
This method evaluates the variants in your A/B test using confidence intervals and p-values.

Here is our Z-Testing algorithm:
```
1. For each variant:
  a. Compute the required sample size.
  b. CHECK: Do we have enough data?
  c. IF NO --> Exit. There is not enough data to get an accurate result.
  d. IF YES -> Compute confidence interval for this variant.
2. If we make it through all the variants, we have enough data to calculate an accurate result.
3. Analyze the confidence intervals.
4. CHECK: Does the variant with the highest success rate stand out?
5. IF NO --> Exit. There is no winner. The results are too close.
6. IF YES --> Exit. The variant with the highest success rate is our winner.
```

## Chi-Square Test and Marascuillo's Procedure

This method evaluates the variants in your A/B test using the Chi Square Test and Marascuillo's Procedure.

Here is a flow chart illustrating the algorithm used in this method:
![Chi-Square Test and Marascuillo's Procedure Flow Chart](http://sendwithus.github.io/confidence/docs/Marascuillo-FlowChart.png)

We break down this algorithm in more detail with examples in our [Chi-Square Test](http://sendwithus.github.io/confidence/docs/CheatSheet-Chi-Square.pdf) and [Marascuillo's Procedure](http://sendwithus.github.io/confidence/docs/CheatSheet-Marascuillo.pdf) cheat sheets.
