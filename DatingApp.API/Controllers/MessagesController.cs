using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using System.Threading.Tasks;
using System.Security.Claims;

using DatingApp.API.Helpers;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using System;
using System.Collections.Generic;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/users/{userId}/messages")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;

        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            _mapper = mapper;
            _repo = repo;
        }

        [HttpGet("{id}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var entry = await _repo.GetMessage(id);
            if (entry == null)
            {
                return NotFound();
            }
            return Ok(entry);
        }

        [HttpGet()]
        public async Task<IActionResult> GetMessagesForUser(int userId, [FromQuery]MessageParams messageParams)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            messageParams.UserId = userId;
            var entry = await _repo.GetMessagesForUser(messageParams);
            var vm = _mapper.Map<IEnumerable<MessageToReturnDto>>(entry);
            Response.AddPagination(entry.CurrentPage, entry.PageSize, entry.TotalCount, entry.TotalPages);
            return Ok(vm);
        }

        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int recipientId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var entries = await _repo.GetMessageThread(userId, recipientId);
            var vm = _mapper.Map<IEnumerable<MessageToReturnDto>>(entries);
            return Ok(vm);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, MessageForCreationDto dto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            dto.SenderId = userId;
            var sender = await _repo.GetUser(userId);
            var recipient = await _repo.GetUser(dto.RecipientId);
            if (recipient == null)
            {
                return BadRequest("Could not find user");
            }
            var entry = _mapper.Map<Message>(dto);
            _repo.Add(entry);
            if (!await _repo.SaveAll())
            {
                throw new Exception("Creating the message failed on save");
            }
            var vm = _mapper.Map<MessageToReturnDto>(entry);
            return CreatedAtRoute("GetMessage", new { id = entry.Id }, vm);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> DeleteMessage(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var entry = await _repo.GetMessage(id);
            if (entry.SenderId == userId)
            {
                entry.SenderDeleted = true;
            }
            else if (entry.RecipientId == userId)
            {
                entry.RecipientDeleted = true;
            }
            else
            {
                throw new Exception("Error deleting the message");
            }
            if (entry.SenderDeleted && entry.RecipientDeleted)
            {
                _repo.Delete(entry);
            }
            if (!await _repo.SaveAll())
            {
                throw new Exception("Error deleting the message");
            }
            return NoContent();
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkMessageAsRead(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var entry = await _repo.GetMessage(id);
            if (entry.RecipientId != userId)
            {
                return Unauthorized();
            }
            entry.IsRead = true;
            entry.DateRead = DateTime.Now;
            if (!await _repo.SaveAll())
            {
                throw new Exception("Error marking message as read");
            }
            return NoContent();
        }
    }
}