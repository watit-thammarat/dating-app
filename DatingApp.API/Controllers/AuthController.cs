using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using System;
using System.IdentityModel.Tokens.Jwt;

using DatingApp.API.Data;
using DatingApp.API.Models;
using DatingApp.API.Dtos;
using AutoMapper;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public AuthController(IAuthRepository repo, IConfiguration config, IMapper mapper)
        {
            _mapper = mapper;
            _config = config;
            _repo = repo;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegisterDto dto)
        {
            // if (!ModelState.IsValid)
            // {
            //     return BadRequest(ModelState);
            // }
            dto.UserName = dto.UserName.ToLower();
            if (await _repo.UserExists(dto.UserName))
            {
                return BadRequest("Username already exists");
            }
            var userToCreate = _mapper.Map<User>(dto);
            var entry = await _repo.Register(userToCreate, dto.Password);
            var vm = _mapper.Map<UserForDetailDto>(entry);
            return CreatedAtRoute("GetUser", new { id = vm.Id }, vm);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            dto.UserName = dto.UserName.ToLower();
            var entry = await _repo.Login(dto.UserName, dto.Password);
            if (entry == null)
            {
                return Unauthorized();
            }
            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, entry.Id.ToString()),
                new Claim(ClaimTypes.Name, entry.Username)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("AppSettings:Token").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var user = _mapper.Map<UserForListDto>(entry);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                user
            });
        }
    }
}