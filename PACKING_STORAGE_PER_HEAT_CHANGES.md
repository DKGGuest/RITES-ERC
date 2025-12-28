# Packing & Storage Per-Heat Implementation

## Overview
Updated the Packing & Storage Checklist to support **per-heat data** instead of a single checklist for all heats. This makes it consistent with other submodules (Visual Inspection, Dimensional Check, Material Testing).

## Changes Made

### Frontend Changes

#### 1. `src/pages/PackingStoragePage.jsx`
- ✅ Added `HeatToggle` component for switching between heats
- ✅ Changed data structure from `packingChecklist` to `packingDataByHeat` (object with heat index as key)
- ✅ Added `activeHeatIndex` state to track current heat
- ✅ Updated all form inputs to use current heat's data
- ✅ Radio button names now include heat index to prevent conflicts

#### 2. `src/pages/RawMaterialDashboard.jsx`
- ✅ Updated `validatePackingStorage` to accept `heatIndex` parameter
- ✅ Updated data collection in `handleFinishInspection` to convert per-heat object to array
- ✅ Changed from single `RmPackingStorageDto` to `List<RmPackingStorageDto>`

### Backend Changes

#### 3. `RmPackingStorageDto.java`
- ✅ Added `heatNo` field
- ✅ Added `heatIndex` field
- ✅ Updated JavaDoc

#### 4. `RmFinishInspectionDto.java`
- ✅ Changed `packingStorageData` from `RmPackingStorageDto` to `List<RmPackingStorageDto>`

#### 5. `RmPackingStorage.java` (Entity)
- ✅ Added `heatNo` column
- ✅ Added `heatIndex` column
- ✅ Removed `unique=true` constraint from `inspection_call_no`
- ✅ Added index on `heat_no`
- ✅ Updated JavaDoc

#### 6. `RmPackingStorageRepository.java`
- ✅ Changed `findByInspectionCallNo` to return `List<RmPackingStorage>` instead of `Optional<RmPackingStorage>`
- ✅ Added `findByInspectionCallNoAndHeatNo` method

#### 7. `RmInspectionServiceImpl.java`
- ✅ Updated `savePackingStorage` to accept `List<RmPackingStorageDto>` and save multiple records
- ✅ Updated `getByCallNo` to fetch and return list of packing storage records

### Database Migration

#### 8. `V1__update_packing_storage_per_heat.sql`
- ✅ Created migration script to:
  - Remove unique constraint on `inspection_call_no`
  - Add `heat_no` column
  - Add `heat_index` column
  - Add indexes for performance

## Required Actions

### 1. Run Database Migration
Execute the migration script on your database:

```sql
-- Run this script on your database
source RITES-SARTHI-BACKEND-main/src/main/resources/db/migration/V1__update_packing_storage_per_heat.sql
```

OR manually run these commands:

```sql
ALTER TABLE rm_packing_storage DROP INDEX inspection_call_no;

ALTER TABLE rm_packing_storage 
ADD COLUMN heat_no VARCHAR(50) AFTER inspection_call_no,
ADD COLUMN heat_index INT AFTER heat_no;

ALTER TABLE rm_packing_storage 
ADD INDEX idx_rm_pack_heat_no (heat_no);

ALTER TABLE rm_packing_storage 
ADD INDEX idx_rm_pack_call_heat (inspection_call_no, heat_no);
```

### 2. Rebuild Backend
The backend needs to be recompiled to pick up the changes:

```bash
cd RITES-SARTHI-BACKEND-main
mvn clean install
```

### 3. Restart Backend Server
After rebuilding, restart your Spring Boot application.

### 4. Clear Browser Cache
Clear localStorage for the inspection call to reset any old data:

```javascript
// In browser console
localStorage.removeItem('rm_packing_storage_CALL-RM-XXX');
```

## Testing

1. **Create a new inspection call** with multiple heats
2. **Navigate to Packing & Storage** section
3. **Verify heat toggle buttons** appear at the top
4. **Fill checklist for Heat 1**, then switch to Heat 2
5. **Verify data is saved independently** for each heat
6. **Click "Finish Inspection"**
7. **Verify no errors** in console
8. **Check database** - should see multiple records in `rm_packing_storage` table (one per heat)

## Data Structure

### Old Structure (localStorage)
```json
{
  "packingChecklist": {
    "bundlingSecure": "Yes",
    "tagsAttached": "Yes",
    ...
  }
}
```

### New Structure (localStorage)
```json
{
  "packingDataByHeat": {
    "0": {
      "bundlingSecure": "Yes",
      "tagsAttached": "Yes",
      ...
    },
    "1": {
      "bundlingSecure": "No",
      "tagsAttached": "Yes",
      ...
    }
  }
}
```

### Backend Payload
```json
{
  "inspectionCallNo": "CALL-RM-001",
  "packingStorageData": [
    {
      "inspectionCallNo": "CALL-RM-001",
      "heatNo": "HEAT001",
      "heatIndex": 0,
      "bundlingSecure": "Yes",
      ...
    },
    {
      "inspectionCallNo": "CALL-RM-001",
      "heatNo": "HEAT002",
      "heatIndex": 1,
      "bundlingSecure": "No",
      ...
    }
  ]
}
```

## Rollback Plan

If you need to rollback:

```sql
-- Remove new columns
ALTER TABLE rm_packing_storage 
DROP COLUMN heat_no,
DROP COLUMN heat_index;

-- Add back unique constraint
ALTER TABLE rm_packing_storage 
ADD UNIQUE KEY inspection_call_no (inspection_call_no);
```

Then revert the code changes and rebuild.

