using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace API.DTOs;

public class RegisterDto
{
    [Required]
    public required string Username { get; set; }
    [Required]
    public required string Password { get; set; }

}