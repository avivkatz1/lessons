import numbers from "./numbers";

const AngleRelationshipPointsCalculated = ({ lesson, newNum, xPosition }) => {
  let displayedQuestion = "";
  let points = [];
  let setTextPosition = [];
  const swapLabels = Math.random() > 0.5; // Randomly decide whether to swap x and number labels

  // Center of the canvas (approximately)
  const centerX = 200;
  const centerY = 250;

  if (lesson === "complementary_angles") {
    // Right angle at vertex with two rays forming 90°
    const vertex = { x: centerX, y: centerY };
    const rayLength = 150;

    // Horizontal ray to the right
    const p1 = { x: vertex.x + rayLength, y: vertex.y };
    // Vertical ray upward
    const p2 = { x: vertex.x, y: vertex.y - rayLength };
    // Ray at an angle between them (random angle for the division)
    const angleDegrees = numbers(1, 50, 20)[0]; // 20-70 degrees (avoid extremes)
    const angleRad = (angleDegrees * Math.PI) / 180;
    const p3 = {
      x: vertex.x + rayLength * Math.cos(angleRad),
      y: vertex.y - rayLength * Math.sin(angleRad),
    };

    points = [
      p1, // 0: end of horizontal ray
      vertex, // 1: vertex (center)
      p2, // 2: end of vertical ray
      p3, // 3: end of angle ray
    ];

    // Calculate safe label positions that avoid the dividing line
    // Lower angle spans from 0° to angleDegrees
    // Upper angle spans from angleDegrees to 90°

    // For lower angle: place label at 1/2 of the angle, but at least 15° from any line
    const lowerAngleSize = angleDegrees;
    const lowerBisectorDeg = Math.min(lowerAngleSize / 2, lowerAngleSize - 15);
    const lowerBisectorRad = (Math.max(15, lowerBisectorDeg) * Math.PI) / 180;

    // For upper angle: place label at midpoint, but at least 15° from the dividing line
    const upperAngleSize = 90 - angleDegrees;
    const upperMidpoint = angleDegrees + upperAngleSize / 2;
    // Ensure at least 15° from dividing line and from vertical
    const upperBisectorDeg = Math.max(angleDegrees + 15, Math.min(upperMidpoint, 75));
    const upperBisectorRad = (upperBisectorDeg * Math.PI) / 180;

    const labelDistance = 60; // distance from vertex

    const lowerPos = {
      x: vertex.x + labelDistance * Math.cos(lowerBisectorRad) - 12,
      y: vertex.y - labelDistance * Math.sin(lowerBisectorRad) - 8,
    };

    const upperPos = {
      x: vertex.x + labelDistance * Math.cos(upperBisectorRad) - 12,
      y: vertex.y - labelDistance * Math.sin(upperBisectorRad) - 8,
    };

    // Set positions (swapLabels controls which label goes where in the diagram)
    setTextPosition = [lowerPos, upperPos];

    displayedQuestion = "Complementary Angles: ∠ABC is a right angle. Find x.";
  } else if (lesson === "supplementary_angles") {
    // Straight line with a ray from the midpoint
    const midpoint = { x: centerX, y: centerY };
    const lineLength = 180;

    // Left and right endpoints of the straight line
    const p1 = { x: midpoint.x - lineLength, y: midpoint.y };
    const p2 = { x: midpoint.x + lineLength, y: midpoint.y };

    // Ray going up at an angle (30-150 to avoid being too close to horizontal)
    const angleDegrees = numbers(1, 120, 30)[0]; // 30-150 degrees from horizontal
    const angleRad = (angleDegrees * Math.PI) / 180;
    const rayLength = 120;
    const p3 = {
      x: midpoint.x + rayLength * Math.cos(angleRad),
      y: midpoint.y - rayLength * Math.sin(angleRad),
    };

    points = [
      p1, // 0: left end of line
      p2, // 1: right end of line
      midpoint, // 2: midpoint (vertex)
      p3, // 3: end of ray
    ];

    // Calculate label positions based on the ray angle
    // Left angle spans from 180° down to angleDegrees
    // Right angle spans from angleDegrees down to 0°
    const labelDistance = 50;

    // Left angle bisector: midpoint between 180° and angleDegrees
    const leftBisectorDeg = (180 + angleDegrees) / 2;
    // Keep at least 15° from the ray and from horizontal
    const safeLeftDeg = Math.max(angleDegrees + 15, Math.min(leftBisectorDeg, 165));
    const leftBisectorRad = (safeLeftDeg * Math.PI) / 180;

    // Right angle bisector: midpoint between angleDegrees and 0°
    const rightBisectorDeg = angleDegrees / 2;
    // Keep at least 15° from the ray and from horizontal
    const safeRightDeg = Math.max(15, Math.min(rightBisectorDeg, angleDegrees - 15));
    const rightBisectorRad = (safeRightDeg * Math.PI) / 180;

    const leftPos = {
      x: midpoint.x + labelDistance * Math.cos(leftBisectorRad) - 12,
      y: midpoint.y - labelDistance * Math.sin(leftBisectorRad) - 8,
    };

    const rightPos = {
      x: midpoint.x + labelDistance * Math.cos(rightBisectorRad) - 12,
      y: midpoint.y - labelDistance * Math.sin(rightBisectorRad) - 8,
    };

    // Set positions (swapLabels controls which label goes where in the diagram)
    setTextPosition = [leftPos, rightPos];

    displayedQuestion = "Supplementary Angles: Find the value of x.";
  } else if (lesson === "vertical_angles") {
    // Two intersecting lines
    const intersection = { x: centerX, y: centerY };
    const lineLength = 140;

    // First line (horizontal-ish)
    const angle1 = numbers(1, 30, 10)[0]; // 10-40 degree slight angle
    const rad1 = (angle1 * Math.PI) / 180;
    const p1 = {
      x: intersection.x - lineLength * Math.cos(rad1),
      y: intersection.y + lineLength * Math.sin(rad1),
    };
    const p2 = {
      x: intersection.x + lineLength * Math.cos(rad1),
      y: intersection.y - lineLength * Math.sin(rad1),
    };

    // Second line (at an angle to the first) - ensure good separation
    const angleBetween = numbers(1, 50, 40)[0]; // 40-90 degrees between lines
    const angle2 = angle1 + angleBetween;
    const rad2 = (angle2 * Math.PI) / 180;
    const p3 = {
      x: intersection.x - lineLength * Math.cos(rad2),
      y: intersection.y + lineLength * Math.sin(rad2),
    };
    const p4 = {
      x: intersection.x + lineLength * Math.cos(rad2),
      y: intersection.y - lineLength * Math.sin(rad2),
    };

    points = [
      p1, // 0: line 1 start
      p2, // 1: line 1 end
      p3, // 2: line 2 start
      p4, // 3: line 2 end
      intersection, // 4: intersection point
    ];

    // Calculate label positions at the center of each vertical angle pair
    // The four angles are at: angle1, angle2, angle1+180, angle2+180
    // Vertical angles are: (angle1, angle1+180) and (angle2, angle2+180)
    // We want to label one pair of vertical angles

    const labelDistance = 45;

    // First angle region: between angle1 and angle2 (upper right quadrant area)
    const firstAngleMid = (angle1 + angle2) / 2;
    const firstAngleRad = (firstAngleMid * Math.PI) / 180;

    // Opposite angle region: between angle1+180 and angle2+180 (lower left quadrant area)
    const oppositeAngleMid = firstAngleMid + 180;
    const oppositeAngleRad = (oppositeAngleMid * Math.PI) / 180;

    const pos1 = {
      x: intersection.x + labelDistance * Math.cos(firstAngleRad) - 12,
      y: intersection.y - labelDistance * Math.sin(firstAngleRad) - 8,
    };

    const pos2 = {
      x: intersection.x + labelDistance * Math.cos(oppositeAngleRad) - 12,
      y: intersection.y - labelDistance * Math.sin(oppositeAngleRad) - 8,
    };

    // Set positions (swapLabels controls which label goes where in the diagram)
    setTextPosition = [pos1, pos2];

    displayedQuestion = "Vertical Angles: Find the value of x.";
  } else if (
    lesson === "corresponding_angles" ||
    lesson === "alternate_interior_angles" ||
    lesson === "same_side_interior_angles"
  ) {
    // Two parallel horizontal lines with a transversal
    const lineLength = 200;
    const lineGap = 120;

    // Top parallel line
    const topY = centerY - lineGap / 2;
    const p1 = { x: centerX - lineLength, y: topY };
    const p2 = { x: centerX + lineLength, y: topY };

    // Bottom parallel line
    const bottomY = centerY + lineGap / 2;
    const p3 = { x: centerX - lineLength, y: bottomY };
    const p4 = { x: centerX + lineLength, y: bottomY };

    // Transversal - diagonal line crossing both
    const transversalAngle = numbers(1, 30, 15)[0]; // 15-45 degree angle
    const transRad = (transversalAngle * Math.PI) / 180;
    const transLength = 200;

    // Calculate where transversal intersects each parallel line
    const topIntersectX = centerX - (lineGap / 2) * Math.tan(transRad);
    const bottomIntersectX = centerX + (lineGap / 2) * Math.tan(transRad);

    const topIntersect = { x: topIntersectX, y: topY };
    const bottomIntersect = { x: bottomIntersectX, y: bottomY };

    // Transversal endpoints (extend beyond the parallel lines)
    const p5 = {
      x: topIntersectX - 60 * Math.cos(Math.PI / 2 - transRad),
      y: topY - 60 * Math.sin(Math.PI / 2 - transRad),
    };
    const p6 = {
      x: bottomIntersectX + 60 * Math.cos(Math.PI / 2 - transRad),
      y: bottomY + 60 * Math.sin(Math.PI / 2 - transRad),
    };

    points = [
      p1, // 0: top line left
      p2, // 1: top line right
      p3, // 2: bottom line left
      p4, // 3: bottom line right
      topIntersect, // 4: top intersection
      bottomIntersect, // 5: bottom intersection
      p5, // 6: transversal top
      p6, // 7: transversal bottom
    ];

    // Calculate label positions based on the transversal angle
    // The transversal creates 8 angles total (4 at each intersection)
    const labelDistance = 35;

    // Transversal angle from vertical (for positioning calculations)
    // At top intersection: angles are at transRad and -transRad from vertical (above/below line)
    // At bottom intersection: same pattern

    // Position for upper-right of top intersection (exterior, right of transversal)
    const topRightPos = {
      x: topIntersect.x + labelDistance * Math.cos(Math.PI / 2 - transRad) - 8,
      y: topIntersect.y - labelDistance * Math.sin(Math.PI / 2 - transRad) - 15,
    };

    // Position for lower-right of top intersection (interior, right of transversal)
    const topInteriorRightPos = {
      x: topIntersect.x + labelDistance * Math.cos(Math.PI / 2 - transRad) - 8,
      y: topIntersect.y + 5,
    };

    // Position for lower-left of bottom intersection (interior, left of transversal)
    const bottomInteriorLeftPos = {
      x: bottomIntersect.x - labelDistance * Math.cos(Math.PI / 2 - transRad) - 25,
      y: bottomIntersect.y - 20,
    };

    // Position for upper-right of bottom intersection (interior, right of transversal)
    const bottomInteriorRightPos = {
      x: bottomIntersect.x + labelDistance * Math.cos(Math.PI / 2 - transRad) - 8,
      y: bottomIntersect.y - 20,
    };

    // Position for lower-right of bottom intersection (exterior, right of transversal)
    const bottomRightPos = {
      x: bottomIntersect.x + labelDistance * Math.cos(Math.PI / 2 - transRad) - 8,
      y: bottomIntersect.y + 5,
    };

    // Position labels based on angle type (swapLabels controls which label goes where in the diagram)
    if (lesson === "corresponding_angles") {
      // Same position at both intersections (e.g., both upper-right exterior)
      setTextPosition = [topRightPos, bottomRightPos];
      displayedQuestion = "Corresponding Angles: The lines are parallel. Find x.";
    } else if (lesson === "alternate_interior_angles") {
      // Opposite sides of transversal, between the parallel lines
      setTextPosition = [topInteriorRightPos, bottomInteriorLeftPos];
      displayedQuestion = "Alternate Interior Angles: The lines are parallel. Find x.";
    } else if (lesson === "same_side_interior_angles") {
      // Same side of transversal, between the parallel lines
      setTextPosition = [topInteriorRightPos, bottomInteriorRightPos];
      displayedQuestion = "Same-Side Interior Angles: The lines are parallel. Find x.";
    }
  }

  // Ensure we have at least 12 points (fill with zeros if needed for compatibility)
  while (points.length < 12) {
    points.push({ x: 0, y: 0 });
  }

  return {
    displayedQuestion,
    points,
    setTextPosition,
    swapLabels,
  };
};

export default AngleRelationshipPointsCalculated;
