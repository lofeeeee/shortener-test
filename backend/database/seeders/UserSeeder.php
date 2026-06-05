<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'username' => 'admin',
                'display_name' => 'Administrator',
                'password' => 'Secret1234!',
                'is_active' => true,
                'can_custom_slug' => true,
                'is_admin' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'username' => 'johndoe',
                'display_name' => 'John Doe',
                'password' => 'Secret1234!',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'inactive@example.com'],
            [
                'username' => 'inactiveuser',
                'display_name' => 'Inactive User',
                'password' => 'Secret1234!',
                'is_active' => false,
            ]
        );
    }
}
