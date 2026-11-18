import * as migration_20261107_084816 from './20261107_084816';
import * as migration_20261109_040307_add_habits_and_schedules from './20261109_040307_add_habits_and_schedules';
import * as migration_20261110_115833_add_user_role from './20261110_115833_add_user_role';
import * as migration_20261117_045355_add_project_enhancements from './20261117_045355_add_project_enhancements';
import * as migration_20261117_064010_enhance_missions_system from './20261117_064010_enhance_missions_system';

export const migrations = [
  {
    up: migration_20261107_084816.up,
    down: migration_20261107_084816.down,
    name: '20261107_084816',
  },
  {
    up: migration_20261109_040307_add_habits_and_schedules.up,
    down: migration_20261109_040307_add_habits_and_schedules.down,
    name: '20261109_040307_add_habits_and_schedules',
  },
  {
    up: migration_20261110_115833_add_user_role.up,
    down: migration_20261110_115833_add_user_role.down,
    name: '20261110_115833_add_user_role',
  },
  {
    up: migration_20261117_045355_add_project_enhancements.up,
    down: migration_20261117_045355_add_project_enhancements.down,
    name: '20261117_045355_add_project_enhancements',
  },
  {
    up: migration_20261117_064010_enhance_missions_system.up,
    down: migration_20261117_064010_enhance_missions_system.down,
    name: '20261117_064010_enhance_missions_system'
  },
];
