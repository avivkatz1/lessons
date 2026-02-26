/**
 * Lesson Data Configuration
 * Phase 2 - Stage 4: Refactored with lazy loading for performance
 *
 * All lesson components are now lazy-loaded to reduce initial bundle size by ~60%.
 * Images are still eagerly loaded as they're small and needed for the lesson menu.
 */

import { lazy } from "react";

// Image imports (small, needed upfront for menu)
import {
  venn_diagram,
  translation,
  shapes,
  rotational_symmetry,
  rotation,
  reflection,
  plotting_points,
  perimeter_area,
  perpendicular,
  patterns,
  parallel,
  basic_probability,
  angles,
  triangleSum,
  equation,
  thirty_sixty_ninety,
  fortyfive_fortyfive_ninety,
  aas,
  alternate_interior_angles,
  asa,
  complementary_angles,
  composite_shape,
  conditional_statements,
  congruent_triangles,
  converse,
  corresponding_angles,
  dilation,
  expected_value,
  flow_charts,
  hl,
  inverse_trig,
  multi_step_word_problems,
  naming_angles,
  probability_area_model,
  probability_tree_diagram,
  pythagorean_theorem,
  pythagorean_triples,
  same_side_interior_angles,
  sas,
  similar_triangles_word_problems,
  slope_triangles,
  sss,
  supplementary_angles,
  system_of_equations,
  tangent,
  all_trig_ratios,
  vertical_angles,
  one_step_equations,
  evaluating_expressions,
  order_of_operations,
  adding_integers,
  subtracting_integers,
  multiplying_integers,
  two_step_equations,
  rounding,
  adding_fractions,
  multiplying_fractions,
  reducing_fractions,
  ruler,
  protractor,
  reflection_symmetry,
} from "../../shared/images";

// Phase 2 - Stage 4: Lazy-loaded components
// These are loaded on-demand when a lesson is selected, not upfront

// Geometry components
const TriangleSum = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TriangleSum }))
);
const Translation = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Translation }))
);
const Reflection = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Reflection }))
);
const SymmetryLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SymmetryLesson }))
);
const Symmetry = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Symmetry }))
);
const SymmetryIdentify = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SymmetryIdentify }))
);
const CompositeShape = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShape }))
);
const CompositeShape2 = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShape2 }))
);
const CompositeShape3 = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShape3 }))
);
const CompositeShapeLessonComp = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShapeLesson }))
);
const TriangleInequality = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TriangleInequality }))
);
const PythagoreanTheorem = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.PythagoreanTheorem }))
);
const Dilation = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Dilation }))
);
const Proportions = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Proportions }))
);
const ProportionsLessonComp = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ProportionsLesson }))
);
const ProportionalReasoning = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.ProportionalReasoning }))
);
const SlopeTriangle = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SlopeTriangle }))
);
const SlopeTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SlopeTrianglesLesson }))
);
const Tangent = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Tangent }))
);
const TangentLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TangentLesson }))
);
const TangentMultiple = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TangentMultiple }))
);
const MoreTangentLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.MoreTangentLesson }))
);
const InverseTrig = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.InverseTrig }))
);
const SidesAndAnglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SidesAndAnglesLesson }))
);
const ShapesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ShapesLesson }))
);
const DilationLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.DilationLesson }))
);
const SimilarTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SimilarTrianglesLesson }))
);
const SimilarityProofsLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SimilarityProofsLesson }))
);
const SimilarTrianglesWordProblemsLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SimilarTrianglesWordProblemsLesson }))
);
const PythagoreanTheoremLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.PythagoreanTheoremLesson }))
);
const PythagoreanTriplesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.PythagoreanTriplesLesson }))
);
const AreaLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Area }))
);
const ZoomFactorLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ZoomFactorLesson }))
);
const AllTrigRatiosLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.AllTrigRatiosLesson }))
);
const InverseTrigLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.InverseTrigLesson }))
);
const ThirtySixtyNinetyLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ThirtySixtyNinetyLesson }))
);
const FortyFiveFortyFiveNinetyLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.FortyFiveFortyFiveNinetyLesson }))
);
const TrigWordProblemsLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TrigWordProblemsLesson }))
);
const SSSCongruentTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SSSCongruentTrianglesLesson }))
);

const SASCongruentTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SASCongruentTrianglesLesson }))
);

const AASCongruentTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.AASCongruentTrianglesLesson }))
);

const ASACongruentTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ASACongruentTrianglesLesson }))
);

// Angle components
const Perpendicular = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.Perpendicular }))
);
const AngleRelationShipsLevelOne = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({
    default: m.AngleRelationShipsLevelOne,
  }))
);
const AngleRelationshipsDiagram = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({
    default: m.AngleRelationshipsDiagram,
  }))
);
const Parallel = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.Parallel }))
);
const ParallelLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ParallelLesson }))
);
const RotationLesson = lazy(() =>
  import("./lessonTypes/geometry/RotationLesson").then((m) => ({ default: m.default }))
);
const AreaPerimeterLesson = lazy(() =>
  import("./lessonTypes/geometry/AreaPerimeterLesson").then((m) => ({ default: m.default }))
);
const TranslationLesson = lazy(() =>
  import("./lessonTypes/geometry/TranslationLesson").then((m) => ({ default: m.default }))
);
const PerpendicularLesson = lazy(() =>
  import("./lessonTypes/geometry/PerpendicularLesson").then((m) => ({ default: m.default }))
);
const NamingAnglesLevelOne = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.NamingAnglesLevelOne }))
);
const NamingAnglesLevelTwo = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.NamingAnglesLevelTwo }))
);
const NamingAnglesLevelThree = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.NamingAnglesLevelThree }))
);
const NamingAnglesLevelFour = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.NamingAnglesLevelFour }))
);
const AnglesLesson = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.AnglesLesson }))
);

// Image lesson components
const ImageLesson = lazy(() =>
  import("../lessons/lessonTypes/imageLessons/index").then((m) => ({ default: m.ImageLesson }))
);
const MeasuringSides = lazy(() =>
  import("../lessons/lessonTypes/imageLessons/index").then((m) => ({ default: m.MeasuringSides }))
);
const Protractor = lazy(() =>
  import("../lessons/lessonTypes/imageLessons/index").then((m) => ({ default: m.Protractor }))
);

// Algebra components
const BasicProblemsWordsOnly = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({
    default: m.BasicProblemsWordsOnly,
  }))
);
const BasicProbability = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.BasicProbability }))
);
const ProbabilityAreaModelLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.ProbabilityAreaModelLesson }))
);
const ProbabilityTreeDiagramLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.ProbabilityTreeDiagramLesson }))
);
const ExpectedValueLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.ExpectedValueLesson }))
);
const FlowChartsLesson = lazy(() =>
  import("../lessons/lessonTypes/logic/index").then((m) => ({ default: m.FlowChartsLesson }))
);
const ConditionalStatementsLesson = lazy(() =>
  import("../lessons/lessonTypes/logic/index").then((m) => ({ default: m.ConditionalStatementsLesson }))
);
const Evaluating = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.Evaluating }))
);
const EvaluatingExpressions = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.EvaluatingExpressions }))
);
const OneStepEquations = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.OneStepEquations }))
);
const TwoStepEquations = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.TwoStepEquations }))
);
const VennDiagram = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.VennDiagram }))
);
const MessAround = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.MessAround }))
);
const SystemOfEquationsL1 = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SystemOfEquationsL1 }))
);
const SystemOfEquationsL2 = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SystemOfEquationsL2 }))
);
const SystemOfEquationsL3 = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SystemOfEquationsL3 }))
);
const SystemOfEquationsL4 = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SystemOfEquationsL4 }))
);
const SystemOfEquationsL5 = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SystemOfEquationsL5 }))
);
const Rounding = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.Rounding }))
);
const OrderOfOperations = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.OrderOfOperations }))
);
const AddingIntegersLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.AddingIntegersLesson }))
);
const SubtractingIntegersLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SubtractingIntegersLesson }))
);
const MultiplyingIntegersLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.MultiplyingIntegersLesson }))
);
const MultiplyingFractionsLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.MultiplyingFractionsLesson }))
);
const SolvingEquationsLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.SolvingEquationsLesson }))
);
const AddingFractions = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.AddingFractions }))
);
const ReducingFractions = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.ReducingFractions }))
);
const PatternsLesson = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.PatternsLesson }))
);

// Graphing components
const PlottingPoints = lazy(() =>
  import("../lessons/lessonTypes/graphing/index").then((m) => ({ default: m.PlottingPoints }))
);
const GraphingLines = lazy(() =>
  import("../lessons/lessonTypes/graphing/index").then((m) => ({ default: m.GraphingLines }))
);

// Export lesson configuration
// Components are lazy-loaded arrays - will be loaded on-demand
export const DataLesson = {
  triangle_sum: {
    lessonImage: triangleSum,
    LessonComponent: [TriangleSum, TriangleSum, TriangleSum, TriangleSum, TriangleSum],
  },
  equations: {
    lessonImage: equation,
    LessonComponent: [
      SolvingEquationsLesson,  // Level 1: One-step equations
      SolvingEquationsLesson,  // Level 2: Two-step equations
      SolvingEquationsLesson,  // Level 3: Multi-step equations
      SolvingEquationsLesson,  // Level 4: Variables on both sides
      SolvingEquationsLesson,  // Level 5: Word problems
    ],
  },
  complementary_angles: {
    lessonImage: complementary_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  vertical_angles: {
    lessonImage: vertical_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  all_angles: {
    lessonImage: complementary_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  supplementary_angles: {
    lessonImage: supplementary_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  corresponding_angles: {
    lessonImage: corresponding_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  parallel: {
    lessonImage: parallel,
    LessonComponent: [
      ParallelLesson,  // Level 1: Identify Parallel Lines
      ParallelLesson,  // Level 2: Match Parallel Pairs
      ParallelLesson,  // Level 3: Make Lines Parallel
      ParallelLesson,  // Level 4: Equations - Identify
      ParallelLesson,  // Level 5: Equations - Find Parallel
    ],
  },
  perpendicular: {
    lessonImage: perpendicular,
    LessonComponent: [
      PerpendicularLesson,  // L1: Drag square to test
      PerpendicularLesson,  // L2: Click pairs
      PerpendicularLesson,  // L3: Make perpendicular
      PerpendicularLesson,  // L4: Identify from equations
      PerpendicularLesson,  // L5: Find equation
    ],
  },
  area_perimeter: {
    lessonImage: perimeter_area,
    LessonComponent: [
      AreaPerimeterLesson, // L1: Draggable Rectangle
      AreaPerimeterLesson, // L2: Compare Rectangles
      AreaPerimeterLesson, // L3: Calculate Area & Perimeter
      AreaPerimeterLesson, // L4: Right Triangles
      AreaPerimeterLesson, // L5: Any Triangle
      AreaPerimeterLesson, // L6: Trapezoid Decomposition
      AreaPerimeterLesson, // L7: Mixed Shapes
      AreaPerimeterLesson, // L8: Word Problems
    ],
  },
  rotational_symmetry: {
    lessonImage: rotational_symmetry,
    LessonComponent: [ImageLesson],
  },
  naming_angles: {
    lessonImage: naming_angles,
    LessonComponent: [NamingAnglesLevelOne, NamingAnglesLevelTwo, NamingAnglesLevelThree, NamingAnglesLevelFour],
  },
  patterns: {
    lessonImage: patterns,
    LessonComponent: [
      PatternsLesson,  // Level 1: Visual arithmetic, small positive differences
      PatternsLesson,  // Level 2: Visual arithmetic, larger differences
      PatternsLesson,  // Level 3: Numeric arithmetic, negatives allowed
      PatternsLesson,  // Level 4: Numeric geometric (×n)
      PatternsLesson,  // Level 5: Mixed arithmetic and geometric
    ],
  },
  shapes: {
    lessonImage: shapes,
    LessonComponent: [
      ShapesLesson,
      ShapesLesson,
      ShapesLesson,
      ShapesLesson,
      ShapesLesson,
    ],
  },
  plotting_points: {
    lessonImage: plotting_points,
    LessonComponent: [
      PlottingPoints,  // Level 1: Quadrant I, small numbers
      PlottingPoints,  // Level 2: Quadrant I, larger numbers
      PlottingPoints,  // Level 3: Introduce negatives
      PlottingPoints,  // Level 4: All four quadrants
      PlottingPoints,  // Level 5: Full range + word problems
    ],
  },
  translation: {
    lessonImage: translation,
    LessonComponent: [
      TranslationLesson,  // L1: Drag with green outline
      TranslationLesson,  // L2: Drag without outline
      TranslationLesson,  // L3: Apply notation
      TranslationLesson,  // L4: Calculate translation
      TranslationLesson,  // L5: Complete the rule
    ],
  },
  reflection: {
    lessonImage: reflection,
    LessonComponent: [
      SymmetryLesson,  // Level 1: Vertical reflection
      SymmetryLesson,  // Level 2: Horizontal reflection
      SymmetryLesson,  // Level 3: Combined
      SymmetryLesson,  // Level 4: Plotting coordinates
      SymmetryLesson,  // Level 5: Diagonal reflection
    ],
  },
  rotation: {
    lessonImage: rotation,
    LessonComponent: [
      RotationLesson, // L1: 90° rotation about origin
      RotationLesson, // L2: 180° rotation about origin
      RotationLesson, // L3: 270° rotation about origin
      RotationLesson, // L4: 90° rotation about a point
      RotationLesson, // L5: Mixed rotations
    ],
  },
  basic_probability: {
    lessonImage: basic_probability,
    LessonComponent: [
      BasicProbability,  // Level 1: Marbles in a bag
      BasicProbability,  // Level 2: Spinner
      BasicProbability,  // Level 3: Complementary events
      BasicProbability,  // Level 4: Independent events
      BasicProbability,  // Level 5: Word problems
    ],
  },
  probability_area_model: {
    lessonImage: probability_area_model,
    LessonComponent: [
      ProbabilityAreaModelLesson,  // Level 1: Read the Area Model
      ProbabilityAreaModelLesson,  // Level 2: Fill in the Missing Cell
      ProbabilityAreaModelLesson,  // Level 3: Find P(A and B)
      ProbabilityAreaModelLesson,  // Level 4: Combined Probability
      ProbabilityAreaModelLesson,  // Level 5: Word Problems
    ],
  },
  probability_tree_diagram: {
    lessonImage: probability_tree_diagram,
    LessonComponent: [
      ProbabilityTreeDiagramLesson,  // Level 1: Read the Tree
      ProbabilityTreeDiagramLesson,  // Level 2: Fill in Missing Branch
      ProbabilityTreeDiagramLesson,  // Level 3: Find P(A and B)
      ProbabilityTreeDiagramLesson,  // Level 4: Multiple Paths
      ProbabilityTreeDiagramLesson,  // Level 5: Word Problems
    ],
  },
  expected_value: {
    lessonImage: expected_value,
    LessonComponent: [
      ExpectedValueLesson,  // Level 1: Read the Table
      ExpectedValueLesson,  // Level 2: Find Missing Value
      ExpectedValueLesson,  // Level 3: Expected Value
      ExpectedValueLesson,  // Level 4: Is It Fair?
      ExpectedValueLesson,  // Level 5: Word Problems
    ],
  },
  flow_charts: {
    lessonImage: flow_charts,
    LessonComponent: [
      FlowChartsLesson,  // Level 1: Identify Symbols
      FlowChartsLesson,  // Level 2: Follow Simple Charts
      FlowChartsLesson,  // Level 3: Complete Charts
      FlowChartsLesson,  // Level 4: Math Calculations
      FlowChartsLesson,  // Level 5: Triangle Similarity Proofs
    ],
  },
  venn_diagrams: {
    lessonImage: venn_diagram,
    LessonComponent: [
      VennDiagram,  // Level 1: 2-circle drag, 4 items (easy)
      VennDiagram,  // Level 2: 2-circle drag, 6 items (harder)
      VennDiagram,  // Level 3: Pre-filled, answer questions
      VennDiagram,  // Level 4: 3-circle drag
      VennDiagram,  // Level 5: Set notation
    ],
  },
  area: {
    lessonImage: perimeter_area,
    LessonComponent: [
      AreaLesson,  // Level 1: Make the Target Area (drag to resize)
      AreaLesson,  // Level 2: Count the Squares (MC)
      AreaLesson,  // Level 3: Area of Rectangles
      AreaLesson,  // Level 4: Area of Triangles (rect cut in half)
      AreaLesson,  // Level 5: Rectangles & Triangles (no formula)
      AreaLesson,  // Level 6: Trapezoids (two triangles)
      AreaLesson,  // Level 7: Parallelograms
      AreaLesson,  // Level 8: All Shapes, No Help
      AreaLesson,  // Level 9: Word Problems (MC)
    ],
  },
  angles: {
    lessonImage: angles,
    LessonComponent: [
      AnglesLesson,  // Level 1: Find the vertex
      AnglesLesson,  // Level 2: Identify the angle region
      AnglesLesson,  // Level 3: Classify Acute/Right/Obtuse
      AnglesLesson,  // Level 4: Estimate the angle
      AnglesLesson,  // Level 5: Make the angle (drag)
    ],
  },
  symmetry: {
    lessonImage: reflection_symmetry,
    LessonComponent: [
      SymmetryIdentify,  // Level 1: Yes/No on letters
      SymmetryIdentify,  // Level 2: Drag line
      SymmetryIdentify,  // Level 3: Count lines
      SymmetryIdentify,  // Level 4: Drag line (hard)
      SymmetryIdentify,  // Level 5: Complete shape
    ],
  },
  same_side_interior_angles: {
    lessonImage: same_side_interior_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  alternate_interior_angles: {
    lessonImage: alternate_interior_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  composite_shapes: {
    lessonImage: composite_shape,
    LessonComponent: [
      CompositeShapeLessonComp,  // Level 1: Identify the Shapes (MC)
      CompositeShapeLessonComp,  // Level 2: L-Shapes (addition)
      CompositeShapeLessonComp,  // Level 3: T-Shapes & U-Shapes
      CompositeShapeLessonComp,  // Level 4: Cutout Shapes (subtraction)
      CompositeShapeLessonComp,  // Level 5: Rectangles + Triangles
      CompositeShapeLessonComp,  // Level 6: Mixed Shapes (no help)
      CompositeShapeLessonComp,  // Level 7: Find Missing Dimension
      CompositeShapeLessonComp,  // Level 8: Word Problems (MC)
    ],
  },
  triangle_inequality: {
    lessonImage: triangleSum,
    LessonComponent: [
      TriangleInequality,
      TriangleInequality,
      TriangleInequality,
      TriangleInequality,
      TriangleInequality,
    ],
  },
  pythagoreon_theorem: {
    lessonImage: pythagorean_theorem,
    LessonComponent: [
      PythagoreanTheoremLesson,  // Level 1: Identify the Hypotenuse
      PythagoreanTheoremLesson,  // Level 2: Find the Hypotenuse
      PythagoreanTheoremLesson,  // Level 3: Find a Missing Leg
      PythagoreanTheoremLesson,  // Level 4: Mixed
      PythagoreanTheoremLesson,  // Level 5: Word Problems
    ],
  },
  pythagorean_triples: {
    lessonImage: pythagorean_triples,
    LessonComponent: [
      PythagoreanTriplesLesson,  // Level 1: Learn the Triples
      PythagoreanTriplesLesson,  // Level 2: Identify from Two Sides
      PythagoreanTriplesLesson,  // Level 3: Find the Missing Side
      PythagoreanTriplesLesson,  // Level 4: Multiples of Triples
      PythagoreanTriplesLesson,  // Level 5: Word Problems
    ],
  },
  dilation: {
    lessonImage: dilation,
    LessonComponent: [
      DilationLesson,
      DilationLesson,
      DilationLesson,
      DilationLesson,
      DilationLesson,
    ],
  },
  similar_triangles: {
    lessonImage: similar_triangles_word_problems,
    LessonComponent: [
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
    ],
  },
  similarity: {
    lessonImage: similar_triangles_word_problems,
    LessonComponent: [
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
      SimilarTrianglesLesson,
    ],
  },
  similarity_proofs: {
    lessonImage: similar_triangles_word_problems,
    LessonComponent: [
      SimilarityProofsLesson,
      SimilarityProofsLesson,
      SimilarityProofsLesson,
      SimilarityProofsLesson,
      SimilarityProofsLesson,
    ],
  },
  similar_triangles_word_problems: {
    lessonImage: similar_triangles_word_problems,
    LessonComponent: [
      SimilarTrianglesWordProblemsLesson, // L1: Shadow Problems
      SimilarTrianglesWordProblemsLesson, // L2: Indirect Measurement
      SimilarTrianglesWordProblemsLesson, // L3: Scale Models & Maps
      SimilarTrianglesWordProblemsLesson, // L4: Photography & Optics
      SimilarTrianglesWordProblemsLesson, // L5: Mixed Applications
      SimilarTrianglesWordProblemsLesson, // L6: Interactive Scene Builder
    ],
  },
  sss_congruent_triangles: {
    lessonImage: sss,
    LessonComponent: [
      SSSCongruentTrianglesLesson, // L1: Recognition (binary choice, same orientation)
      SSSCongruentTrianglesLesson, // L2: Match Sides (toggle buttons, mixed orientations)
      SSSCongruentTrianglesLesson, // L3: Find Congruent Pair (grid, rotated/flipped)
      SSSCongruentTrianglesLesson, // L4: Find Missing Side (answer input, all orientations)
      SSSCongruentTrianglesLesson, // L5: Word Problems (real-world applications)
    ],
  },
  // Alias for menu compatibility
  sss: {
    lessonImage: sss,
    LessonComponent: [
      SSSCongruentTrianglesLesson,
      SSSCongruentTrianglesLesson,
      SSSCongruentTrianglesLesson,
      SSSCongruentTrianglesLesson,
      SSSCongruentTrianglesLesson,
    ],
  },
  sas_congruent_triangles: {
    lessonImage: sas,
    LessonComponent: [
      SASCongruentTrianglesLesson, // L1: Recognition (binary choice, same orientation)
      SASCongruentTrianglesLesson, // L2: Match Parts (toggle buttons, mixed orientations)
      SASCongruentTrianglesLesson, // L3: Find Congruent Pair (grid, rotated/flipped)
      SASCongruentTrianglesLesson, // L4: Find Missing Measurement (answer input, all orientations)
      SASCongruentTrianglesLesson, // L5: Word Problems (real-world applications)
    ],
  },
  // Alias for menu compatibility
  sas: {
    lessonImage: sas,
    LessonComponent: [
      SASCongruentTrianglesLesson,
      SASCongruentTrianglesLesson,
      SASCongruentTrianglesLesson,
      SASCongruentTrianglesLesson,
      SASCongruentTrianglesLesson,
    ],
  },
  aas_congruent_triangles: {
    lessonImage: aas,
    LessonComponent: [
      AASCongruentTrianglesLesson, // L1: Recognition (binary choice)
      AASCongruentTrianglesLesson, // L2: Identify Parts (toggle classification)
      AASCongruentTrianglesLesson, // L3: Find Congruent Pair (grid)
      AASCongruentTrianglesLesson, // L4: Find Missing Measurement (input)
      AASCongruentTrianglesLesson, // L5: Word Problems (real-world applications)
    ],
  },
  // Alias for menu compatibility
  aas: {
    lessonImage: aas,
    LessonComponent: [
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
    ],
  },
  asa_congruent_triangles: {
    lessonImage: asa,
    LessonComponent: [
      ASACongruentTrianglesLesson, // L1: Recognition (binary choice)
      ASACongruentTrianglesLesson, // L2: Identify Parts (toggle classification)
      ASACongruentTrianglesLesson, // L3: Find Congruent Pair (grid)
      ASACongruentTrianglesLesson, // L4: Find Missing Measurement (input)
      ASACongruentTrianglesLesson, // L5: Word Problems (real-world applications)
    ],
  },
  // Alias for menu compatibility
  asa: {
    lessonImage: asa,
    LessonComponent: [
      ASACongruentTrianglesLesson,
      ASACongruentTrianglesLesson,
      ASACongruentTrianglesLesson,
      ASACongruentTrianglesLesson,
      ASACongruentTrianglesLesson,
    ],
  },
  proportions: {
    lessonImage: equation,
    LessonComponent: [
      ProportionsLessonComp, // L1: Identify Equal Ratios
      ProportionsLessonComp, // L2: Complete the Proportion
      ProportionsLessonComp, // L3: Cross-Multiply Intro
      ProportionsLessonComp, // L4: Solve Any Position
      ProportionsLessonComp, // L5: Scale Factor Problems
      ProportionsLessonComp, // L6: Proportion Word Problems
      ProportionsLessonComp, // L7: Harder Proportions
      ProportionsLessonComp, // L8: Mixed Word Problems (MC)
    ],
  },
  zoom_factor: {
    lessonImage: dilation,
    LessonComponent: [
      ZoomFactorLesson,  // Level 1: Identify the Zoom Factor
      ZoomFactorLesson,  // Level 2: Drag to Zoom
      ZoomFactorLesson,  // Level 3: Find New Dimensions
      ZoomFactorLesson,  // Level 4: Area After Zoom
      ZoomFactorLesson,  // Level 5: Word Problems
    ],
  },
  proportional_reasoning: {
    lessonImage: equation,
    LessonComponent: [
      ProportionalReasoning, // L1: Visual Ratios (MC)
      ProportionalReasoning, // L2: Ratio Tables (input)
      ProportionalReasoning, // L3: Unit Rates (input)
      ProportionalReasoning, // L4: Proportional vs Non-Proportional (MC)
      ProportionalReasoning, // L5: Real-World Applications (input)
    ],
  },
  slope_triangles: {
    lessonImage: slope_triangles,
    LessonComponent: [
      SlopeTrianglesLesson,  // Level 1: Identify Rise & Run (MC)
      SlopeTrianglesLesson,  // Level 2: Compute Slope (MC)
      SlopeTrianglesLesson,  // Level 3: Slope from Coordinates (Input)
      SlopeTrianglesLesson,  // Level 4: Slope is Constant (Input)
      SlopeTrianglesLesson,  // Level 5: Bridge to Tangent (Input)
    ],
  },
  tangent: {
    lessonImage: tangent,
    LessonComponent: [TangentLesson],
  },
  more_tangent: {
    lessonImage: tangent,
    LessonComponent: [
      MoreTangentLesson,  // Level 1: Identify sides (colored hints)
      MoreTangentLesson,  // Level 2: Calculate tangent (no color hints)
      MoreTangentLesson,  // Level 3: Find missing side (basic)
      MoreTangentLesson,  // Level 4: Find missing side (challenging)
      MoreTangentLesson,  // Level 5: Find angle (inverse tangent)
    ],
  },
  all_trig_ratios: {
    lessonImage: all_trig_ratios,
    LessonComponent: [
      AllTrigRatiosLesson,  // Level 1: Identify the Ratio
      AllTrigRatiosLesson,  // Level 2: Which Function?
      AllTrigRatiosLesson,  // Level 3: Set Up the Equation
      AllTrigRatiosLesson,  // Level 4: Solve for the Side
      AllTrigRatiosLesson,  // Level 5: Find the Angle
      AllTrigRatiosLesson,  // Level 6: Word Problems
    ],
  },
  mess_around: {
    lessonImage: reflection_symmetry,
    LessonComponent: [MessAround],
  },
  system_of_equations: {
    lessonImage: system_of_equations,
    LessonComponent: [
      SystemOfEquationsL1, // Level 1: Graphical method (Konva graph)
      SystemOfEquationsL2, // Level 2: Easy elimination (same coefficient)
      SystemOfEquationsL3, // Level 3: Substitution (y already solved)
      SystemOfEquationsL4, // Level 4: Harder (elimination w/ mult or substitution w/ rearranging)
      SystemOfEquationsL5, // Level 5: Word problems
    ],
  },
  inverse_trig: {
    lessonImage: inverse_trig,
    LessonComponent: [
      InverseTrigLesson,  // Level 1: Pick the Inverse Function (MC)
      InverseTrigLesson,  // Level 2: Set Up the Expression (MC)
      InverseTrigLesson,  // Level 3: Find the Angle - basic (Input)
      InverseTrigLesson,  // Level 4: Find the Angle - mixed (Input)
      InverseTrigLesson,  // Level 5: Word Problems (Input)
    ],
  },
  thirty_sixty_ninety: {
    lessonImage: thirty_sixty_ninety,
    LessonComponent: [
      ThirtySixtyNinetyLesson,  // Level 1: Learn the Pattern (MC)
      ThirtySixtyNinetyLesson,  // Level 2: Short Leg Given (MC)
      ThirtySixtyNinetyLesson,  // Level 3: Find Missing Side (Input)
      ThirtySixtyNinetyLesson,  // Level 4: Work Backwards (Input)
      ThirtySixtyNinetyLesson,  // Level 5: Word Problems (Input)
    ],
  },
  forty_five_forty_five_ninety: {
    lessonImage: fortyfive_fortyfive_ninety,
    LessonComponent: [
      FortyFiveFortyFiveNinetyLesson,  // Level 1: Learn the Pattern (MC)
      FortyFiveFortyFiveNinetyLesson,  // Level 2: Leg Given (MC)
      FortyFiveFortyFiveNinetyLesson,  // Level 3: Find Missing Side (Input)
      FortyFiveFortyFiveNinetyLesson,  // Level 4: Work Backwards (Input)
      FortyFiveFortyFiveNinetyLesson,  // Level 5: Word Problems (Input)
    ],
  },
  trig_word_problems: {
    lessonImage: tangent,
    LessonComponent: [
      TrigWordProblemsLesson,  // Level 1: Visual Ladder Problems
      TrigWordProblemsLesson,  // Level 2: Visual Elevation/Depression
      TrigWordProblemsLesson,  // Level 3: Height Finding
      TrigWordProblemsLesson,  // Level 4: Angle Finding
      TrigWordProblemsLesson,  // Level 5: Mixed Applications
    ],
  },
  order_of_operations: {
    lessonImage: order_of_operations,
    LessonComponent: [
      OrderOfOperations,  // Level 1: Click operators (+ × only, no parens)
      OrderOfOperations,  // Level 2: Click operators (all 4 ops, with parens)
      OrderOfOperations,  // Level 3: Click operators (parens + exponents)
      OrderOfOperations,  // Level 4: Type the final answer
    ],
  },
  evaluating_expressions: {
    lessonImage: evaluating_expressions,
    LessonComponent: [
      EvaluatingExpressions,  // Level 1: Drag tiles into 2 groups
      EvaluatingExpressions,  // Level 2: Drag tiles into 3 groups
      EvaluatingExpressions,  // Level 3: Type simplified (x, const)
      EvaluatingExpressions,  // Level 4: Type simplified (x², x, const)
      EvaluatingExpressions,  // Level 5: Complex with xy terms
    ],
  },
  one_step_equations: {
    lessonImage: one_step_equations,
    LessonComponent: [
      OneStepEquations,  // Level 1: x + a = b
      OneStepEquations,  // Level 2: x - a = b
      OneStepEquations,  // Level 3: ax = b
      OneStepEquations,  // Level 4: x ÷ a = b
      OneStepEquations,  // Level 5: Mixed operations
    ],
  },
  adding_integers: {
    lessonImage: adding_integers,
    LessonComponent: [
      AddingIntegersLesson, // L1: Number line (both positive)
      AddingIntegersLesson, // L2: Chips (both negative)
      AddingIntegersLesson, // L3: Mixed (positive result)
      AddingIntegersLesson, // L4: Mixed (negative result)
      AddingIntegersLesson, // L5: Word problems
    ],
  },
  subtracting_integers: {
    lessonImage: subtracting_integers,
    LessonComponent: [
      SubtractingIntegersLesson, // L1: Keep Change Change (positive - positive)
      SubtractingIntegersLesson, // L2: Subtracting negatives
      SubtractingIntegersLesson, // L3: Negative - positive
      SubtractingIntegersLesson, // L4: Negative - negative
      SubtractingIntegersLesson, // L5: Word problems
    ],
  },
  multiplying_integers: {
    lessonImage: multiplying_integers,
    LessonComponent: [
      MultiplyingIntegersLesson, // L1: Positive · Positive
      MultiplyingIntegersLesson, // L2: Positive · Negative
      MultiplyingIntegersLesson, // L3: Negative · Positive
      MultiplyingIntegersLesson, // L4: Negative · Negative
      MultiplyingIntegersLesson, // L5: Sign Prediction
      MultiplyingIntegersLesson, // L6: Word problems
    ],
  },
  two_step_equations: {
    lessonImage: two_step_equations,
    LessonComponent: [
      TwoStepEquations,  // Level 1: ax + b = c
      TwoStepEquations,  // Level 2: ax ± b = c
      TwoStepEquations,  // Level 3: x/a ± b = c
      TwoStepEquations,  // Level 4: Mixed
      TwoStepEquations,  // Level 5: Negatives
    ],
  },
  rounding: {
    lessonImage: rounding,
    LessonComponent: [
      Rounding, // Level 1: Whole number rounding
      Rounding, // Level 2: Decimal rounding
      Rounding, // Level 3: Mixed + extended
      Rounding, // Level 4: Word problems
    ],
  },
  adding_fractions: {
    lessonImage: adding_fractions,
    LessonComponent: [
      AddingFractions,  // Level 1: Same denominator
      AddingFractions,  // Level 2: One denom is a multiple
      AddingFractions,  // Level 3: Different denominators (LCD)
      AddingFractions,  // Level 4: Word problems
    ],
  },
  multiplying_fractions: {
    lessonImage: multiplying_fractions,
    LessonComponent: [
      MultiplyingFractionsLesson,  // Level 1: Simple fractions
      MultiplyingFractionsLesson,  // Level 2: Larger fractions
      MultiplyingFractionsLesson,  // Level 3: Simplifying results
      MultiplyingFractionsLesson,  // Level 4: Mixed difficulty
      MultiplyingFractionsLesson,  // Level 5: Word problems
    ],
  },
  solving_equations: {
    lessonImage: equation,
    LessonComponent: [
      SolvingEquationsLesson,  // Level 1: One-step equations
      SolvingEquationsLesson,  // Level 2: Two-step equations
      SolvingEquationsLesson,  // Level 3: Multi-step equations
      SolvingEquationsLesson,  // Level 4: Variables on both sides
      SolvingEquationsLesson,  // Level 5: Word problems
    ],
  },
  reducing_fractions: {
    lessonImage: reducing_fractions,
    LessonComponent: [
      ReducingFractions,  // Level 1: Halving
      ReducingFractions,  // Level 2: Easy common factors
      ReducingFractions,  // Level 3: Find the GCD
      ReducingFractions,  // Level 4: Already reduced?
      ReducingFractions,  // Level 5: Word problems
    ],
  },
  measuring_sides: {
    lessonImage: ruler,
    LessonComponent: [
      MeasuringSides,  // Level 1: Whole inches
      MeasuringSides,  // Level 2: Half inches
      MeasuringSides,  // Level 3: Quarter inches
      MeasuringSides,  // Level 4: Eighth inches
      MeasuringSides,  // Level 5: Two measurements (add/subtract)
    ],
  },
  sides_and_angles: {
    lessonImage: shapes,
    LessonComponent: [
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
    ],
  },
  // Alias for Chapter 1 navigation
  sides: {
    lessonImage: shapes,
    LessonComponent: [
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
      SidesAndAnglesLesson,
    ],
  },
  measuring_angles: {
    lessonImage: protractor,
    LessonComponent: [
      Protractor,  // Level 1: Multiples of 10°
      Protractor,  // Level 2: Multiples of 5°
      Protractor,  // Level 3: Any whole degree
      Protractor,  // Level 4: Identify type + measure
      Protractor,  // Level 5: Two angles (add/subtract)
    ],
  },
  graphing_lines: {
    lessonImage: plotting_points,
    LessonComponent: [
      GraphingLines,  // Level 1: Identify y-intercept
      GraphingLines,  // Level 2: Identify slope
      GraphingLines,  // Level 3: Write equation (positive slopes)
      GraphingLines,  // Level 4: Write equation (any slope)
      GraphingLines,  // Level 5: Plot the line from equation
    ],
  },
  conditional_statements: {
    lessonImage: conditional_statements,
    LessonComponent: [
      ConditionalStatementsLesson,  // Level 1: Drag to Build
      ConditionalStatementsLesson,  // Level 2: Match Converse
      ConditionalStatementsLesson,  // Level 3: Build Inverse
      ConditionalStatementsLesson,  // Level 4: Match All Forms
      ConditionalStatementsLesson,  // Level 5: Build Contrapositive
    ],
  },
};
