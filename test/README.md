# Basketball Stat Tracker - Test Documentation

This directory contains comprehensive test suites for all modules in the Basketball Stat Tracker application.

## Test Files Overview

### Core Module Tests

- **test_event.py** - Tests for the Event class and Action enum
- **test_game.py** - Tests for the Game class and ShotZone enum
- **test_analytics.py** - Tests for analytics functions (shot zone detection, FG% calculation)
- **test_heatmap.py** - Original heatmap tests (kept for compatibility)
- **test_heatmap_comprehensive.py** - Comprehensive heatmap class tests
- **test_db.py** - Database operations tests (with mocking)
- **test_main.py** - Tests for the main application entry point

### Test Configuration

- **test_suite.py** - Master test runner and integration tests
- **pytest.ini** - Pytest configuration file

## Running Tests

### Run All Tests

```bash
cd "/Users/jonahtran/Desktop/Github/Basketball Stat Tracker"
python -m pytest test/ -v
```

### Run Specific Test Files

```bash
# Test specific module
python -m pytest test/test_event.py -v

# Test with coverage (if pytest-cov installed)
python -m pytest test/ --cov=. --cov-report=html
```

### Run Test Categories

```bash
# Run only unit tests
python -m pytest test/ -m unit

# Run only integration tests
python -m pytest test/ -m integration

# Skip slow tests
python -m pytest test/ -m "not slow"
```

## Test Categories

### Unit Tests

- Individual function and method testing
- Class instantiation and basic functionality
- Enum value verification
- Input validation

### Integration Tests

- Multi-module interactions
- Database operations (mocked)
- End-to-end workflows
- Error handling across modules

### Edge Case Tests

- Boundary conditions
- Invalid inputs
- Empty data sets
- Performance with large datasets

## Known Issues and Limitations

### Current Code Issues Found During Testing

1. **game.py**: Variable naming bug (`points` vs `self.points`)
2. **game.py**: Shot attempts not tracked for missed shots
3. **game.py**: DataFrame indexing issues in zone stats
4. **db.py**: Multiple table name inconsistencies ("player_game" vs "player_games")
5. **db.py**: Incorrect supabase method calls in some places

### Test Dependencies

- pytest
- matplotlib (for heatmap tests)
- numpy (for data generation)
- pandas (for dataframe operations)
- python-dotenv (for environment variables)
- supabase (mocked in tests)

### Database Tests

Database tests use mocking to avoid requiring actual Supabase connections. For integration testing with real database:

1. Set up test database
2. Configure environment variables
3. Remove mocking decorators
4. Run with `pytest test/test_db.py -m database`

## Adding New Tests

When adding new functionality:

1. **Create test file**: `test_[module_name].py`
2. **Follow naming convention**:
   - Test classes: `TestClassName`
   - Test methods: `test_method_description`
3. **Use descriptive docstrings**
4. **Add appropriate markers**
5. **Mock external dependencies**
6. **Test both success and failure cases**

### Example Test Structure

```python
import pytest
import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')

from your_module import YourClass

class TestYourClass:
    def test_initialization(self):
        """Test class initialization."""
        obj = YourClass()
        assert obj is not None

    def test_method_success(self):
        """Test method with valid input."""
        obj = YourClass()
        result = obj.method(valid_input)
        assert result == expected_output

    def test_method_failure(self):
        """Test method with invalid input."""
        obj = YourClass()
        with pytest.raises(ExpectedException):
            obj.method(invalid_input)
```

## Continuous Integration

For CI/CD pipelines:

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests with coverage
python -m pytest test/ --cov=. --cov-report=xml --junitxml=test-results.xml

# Generate coverage reports
coverage html
```

## Performance Testing

For performance benchmarks:

```bash
# Install pytest-benchmark
pip install pytest-benchmark

# Run performance tests
python -m pytest test/ --benchmark-only
```
