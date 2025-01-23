<?php

// Connexion à la base de données
$host = 'localhost';
$dbname = 'cesi_porteouverte';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur : " . $e->getMessage());
}

// Enregistrement du joueur
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nom_joueur'])) {
    $nom_joueur = htmlspecialchars($_POST['nom_joueur']);

    // Vérifie si le joueur existe déjà
    $query = $pdo->prepare("SELECT JOU_ID FROM joueurs WHERE JOU_Nom = :nom_joueur");
    $query->execute(['nom_joueur' => $nom_joueur]);
    $joueur = $query->fetch(PDO::FETCH_ASSOC);

    if (!$joueur) {
        // Insère un nouveau joueur
        $query = $pdo->prepare("INSERT INTO joueurs (JOU_Nom) VALUES (:nom_joueur)");
        $query->execute(['nom_joueur' => $nom_joueur]);
        $joueur_id = $pdo->lastInsertId();
    } else {
        $joueur_id = $joueur['JOU_ID'];
    }

    echo json_encode(['joueur_id' => $joueur_id]);
    exit;
}

// Enregistrement d'une partie
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['partie'])) {
    $partie = json_decode($_POST['partie'], true);

    $joueur_id = $partie['joueur_id'];
    $chrono_total = $partie['chrono_total'];
    $mots_par_minute = $partie['mots_par_minute'];
    $nombre_erreurs = $partie['nombre_erreurs'];

    // Calcul du pourcentage d'erreurs
    $total_letters = strlen($partie['phrase_originale']);
    $error_percentage = ($total_letters > 0) ? ($nombre_erreurs / $total_letters) * 100 : 0;

    $query = $pdo->prepare("INSERT INTO parties (JOU_ID, PAR_Chrono, PAR_MotsParMinute, PAR_NombreErreurs, PAR_PourcentageErreurs) 
                             VALUES (:joueur_id, :chrono_total, :mots_par_minute, :nombre_erreurs, :error_percentage)");
    $query->execute([
        'joueur_id' => $joueur_id,
        'chrono_total' => $chrono_total,
        'mots_par_minute' => $mots_par_minute,
        'nombre_erreurs' => $nombre_erreurs,
        'error_percentage' => $error_percentage
    ]);

    echo json_encode(['status' => 'success']);
    exit;
}

// Récupération des scores
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'scores') {
    $query = $pdo->query("SELECT joueurs.JOU_Nom, PAR_Chrono, PAR_MotsParMinute, PAR_NombreErreurs, PAR_PourcentageErreurs 
                          FROM parties 
                          JOIN joueurs ON parties.JOU_ID = joueurs.JOU_ID 
                          ORDER BY PAR_MotsParMinute DESC LIMIT 10");
    $scores = $query->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($scores);
    exit;
}

?>