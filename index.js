$(document).ready(() => {
  let API_URL = "http://localhost:3000/notes";
  let editingId = null;

  let fetchTasks = () => {
    $(".loading").show();
    $(".show-container").empty(); 
    $.get(API_URL)
      .done((data) => {
        if (!data.length) {
          return $(".show-container").html("<p>No tasks found.</p>");
        }
        data.forEach(({ id, title, description, date }) => {
          $(".show-container").append(`
            <div class="card" data-id="${id}">
              <h3>${title}</h3>
              <p>${description}</p>
              <hr>
              <div class="more">
                <small>${date}</small>
                <i class="fa-solid fa-angles-right more-icon"></i>
                <button class="edit-btn" data-id="${id}" style="display:none;">Edit</button>
                <button class="delete-btn" data-id="${id}" style="display:none;">Delete</button>
              </div>
            </div>
          `);
        });
      })
      .fail(() => alert("Error loading tasks."))
      .always(() => $(".loading").hide());
  };

  fetchTasks();

  $("#add").click(() => $(".form-container").fadeIn());

  $("#cancel").click(() => {
    $(".form-container").fadeOut();
    $("#title, #desc").val("");
    editingId = null;
    $("#submit").text("Add Task");
  });

  $(document).on("mouseenter", ".more-icon", function () {
    $(this).siblings(".edit-btn, .delete-btn").fadeIn();
  });

  $(document).on("mouseleave", ".more", function () {
    $(this).find(".edit-btn, .delete-btn").fadeOut();
  });

  $("#submit").click((event) => {
    event.preventDefault();
    let title = $("#title").val().trim(),
        desc = $("#desc").val().trim();
    if (!title || !desc) return alert("Fill in both fields.");

    $(".loading").show();

    if (editingId) {
      $.ajax(`${API_URL}/${editingId}`, {
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
          title,
          description: desc,
          date: new Date().toLocaleDateString(),
        }),
      })
        .done(() => {
          let card = $(`.card[data-id='${editingId}']`);
          card.find("h3").text(title);
          card.find("p").text(desc);
          card.find("small").text(new Date().toLocaleDateString());

          editingId = null;
          $("#submit").text("Add Task");
          $("#title, #desc").val("");
          $(".form-container").fadeOut();
        })
        .fail(() => alert("Error updating task."))
        .always(() => $(".loading").hide());
    } else {
      $.post(API_URL, {
        title,
        description: desc,
        date: new Date().toLocaleDateString(),
      })
        .done((newTask) => {
          $(".show-container").append(`
            <div class="card" data-id="${newTask.id}">
              <h3>${newTask.title}</h3>
              <p>${newTask.description}</p>
              <hr>
              <div class="more">
                <small>${newTask.date}</small>
                <i class="fa-solid fa-angles-right more-icon"></i>
                <button class="edit-btn" data-id="${newTask.id}" style="display:none;">Edit</button>
                <button class="delete-btn" data-id="${newTask.id}" style="display:none;">Delete</button>
              </div>
            </div>
          `);
          $("#title, #desc").val("");
        })
        .fail(() => alert("Error saving task."))
        .always(() => $(".loading").hide());
    }
  });

  $(document).on("click", ".delete-btn", function () {
    if (confirm("Delete this task?")) {
      let taskId = $(this).data("id");
      $.ajax(`${API_URL}/${taskId}`, { type: "DELETE" })
        .done(() => {
          $(`.card[data-id='${taskId}']`).remove(); 
        })
        .fail(() => alert("Error deleting task."));
    }
  });

  $(document).on("click", ".edit-btn", function () {
    let card = $(this).closest(".card");
    let id = $(this).data("id");

    editingId = id;
    $("#title").val(card.find("h3").text());
    $("#desc").val(card.find("p").text());
    $("#submit").text("Update Task");
    $(".form-container").fadeIn();
  });
});
