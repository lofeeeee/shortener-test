<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'username' => 'admin',
            'display_name' => 'Administrator',
            'email' => 'admin@example.com',
            'password' => 'Secret1234!',
            'is_active' => true,
        ]);

        User::create([
            'username' => 'johndoe',
            'display_name' => 'John Doe',
            'email' => 'user@example.com',
            'password' => 'Secret1234!',
            'is_active' => true,
        ]);

        User::create([
            'username' => 'inactiveuser',
            'display_name' => 'Inactive User',
            'email' => 'inactive@example.com',
            'password' => 'Secret1234!',
            'is_active' => false,
        ]);
    }
}
